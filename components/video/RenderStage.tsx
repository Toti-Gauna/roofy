'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { useTranslations } from 'next-intl';
import RealEstateDemo from '@/components/demos/real-estate/RealEstateDemo';
import { LensProvider, type Lens } from '@/components/demos/real-estate/lens';
import { useEstateText } from '@/components/demos/real-estate/ui';
import { beatLimitFor, lockedFromFor } from '@/components/experience/lens';
import { PhaseGlyph } from '@/components/ui/PhaseGlyph';
import { planInfo, planPhase } from '@/lib/plans';
import type { SoundName } from '@/lib/sound/types';
import { FORMATS, FPS, TIME, checkCues, cuesFor, lerp, toVtt, tween, type Ratio } from './timeline';
import type { Piece, PieceShot, Step, Take } from './piece';
import { syncAnimations } from './clock';
import { renderMix } from './audio';
import './video.css';

/** The screens Lumen is filmed at (CSS px): the desktop at 16:10, the phone at 9:19.5. */
const SCREEN = { laptop: { w: 1440, h: 900 }, phone: { w: 430, h: 932 } } as const;
/** The camera never enlarges the interface beyond this (text would look blown up). */
const MAX_ZOOM = 2.4;

export interface StageApi {
  /** The piece's plan, as the driver needs it. */
  plan: { piece: string; ratio: Ratio; width: number; height: number; fps: number; duration: number; shots: { id: string; start: number; end: number }[] };
  /** Mounts shot `i`'s take (fresh) and returns how long its preroll is (ms). */
  enter(i: number): Promise<number>;
  /** Shows shot `i` at local time `local` (negative: the preroll); `virtual` is the simulated clock. */
  tick(i: number, local: number, virtual: number): Promise<void>;
  /** Sound effects at video times (for the offline mix). */
  cues(): { at: number; name: SoundName }[];
  /** The music and the effects, mixed offline by the site's engine: a 16-bit stereo WAV in base64. */
  renderAudio(duration: number, cues: { at: number; name: SoundName }[]): Promise<string>;
  /** The on-screen words as WebVTT in this page's language, and any rule they break (§3). */
  subtitles(): { vtt: string; problems: string[] };
}

declare global {
  interface Window {
    __video?: StageApi;
  }
}

/** Waits until React has committed what the last events and timers scheduled (it posts its work as tasks). */
function settle(rounds = 6): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    let n = 0;
    channel.port1.onmessage = () => (++n >= rounds ? resolve() : channel.port2.postMessage(0));
    channel.port2.postMessage(0);
  });
}

interface Camera {
  /** Window size. */
  ww: number;
  wh: number;
  /** Translation and scale that frame the target. */
  ox: number;
  oy: number;
  k: number;
}

/** Where the camera sits so `target` (screen px) fits the window, without showing past the screen's edges. */
function frameCamera(
  target: { x: number; y: number; w: number; h: number },
  screen: { w: number; h: number },
  ww: number,
  wh: number,
  { align = {}, cover = false, zoom }: { align?: { x?: number; y?: number }; cover?: boolean; zoom?: number } = {},
): Camera {
  // contain: the whole target shows; cover: it fills the window (the long side is trimmed evenly).
  const fit = cover ? Math.max(ww / target.w, wh / target.h) : Math.min(ww / target.w, wh / target.h);
  const k = Math.min(MAX_ZOOM, zoom ?? fit);
  const place = (size: number, room: number, at: number, a: number, full: number) => {
    const o = (room - size * k) * a - at * k;
    const span = full * k;
    return span >= room ? Math.min(0, Math.max(room - span, o)) : (room - span) / 2;
  };
  return { ww, wh, k, ox: place(target.w, ww, target.x, align.x ?? 0.5, screen.w), oy: place(target.h, wh, target.y, align.y ?? 0.5, screen.h) };
}

/** The camera at local time `local`: the framing plus a slow push toward the window's centre (§2 cámara). */
function cameraStyle(cam: Camera, push: number, local: number, dur: number): CSSProperties {
  const s = 1 + push * tween(local, 0, dur, 'inOut');
  const cx = cam.ww / 2;
  const cy = cam.wh / 2;
  const x = cx + s * (cam.ox - cx);
  const y = cy + s * (cam.oy - cy);
  return { transform: `translate(${x.toFixed(3)}px, ${y.toFixed(3)}px) scale(${(cam.k * s).toFixed(5)})` };
}

/** The take's screens. The laptop and the phone share one story when both are mounted (the buyer's phone). */
function TakeScreens({ take }: { take: Take }) {
  const phone = (
    <div className="device-phone vid-device" data-on={take.view !== 'laptop' ? '' : undefined}>
      <div className="vid-screen" style={{ width: SCREEN.phone.w, height: SCREEN.phone.h }}>
        <RealEstateDemo screen="phone" active />
      </div>
    </div>
  );
  if (take.view === 'app') return <div data-demo-host className="vid-host">{phone}</div>;
  return (
    <div data-demo-host className="vid-host">
      <div className="device-laptop vid-device" data-on={take.view === 'laptop' ? '' : undefined}>
        <div className="vid-screen" style={{ width: SCREEN.laptop.w, height: SCREEN.laptop.h }}>
          <RealEstateDemo screen="laptop" active />
        </div>
      </div>
      {phone}
    </div>
  );
}

/** Where the visitor (or Carolina) touches: window px and the local time it starts. */
interface Ring {
  x: number;
  y: number;
  at: number;
}

const prerollOf = (s: PieceShot, ratio: Ratio) => (s.kind === 'ui' ? Math.max(0, ...(s.takes?.[ratio]?.steps ?? []).map((st) => -st.at)) + 400 : 0);

export function RenderStage({ piece, ratio }: { piece: Piece; ratio: Ratio }) {
  const t = useTranslations('video');
  const tl = useTranslations('demoRealEstate');
  const tk = useTranslations('demoKit');
  const x = useEstateText();
  const format = FORMATS[ratio];
  const plan = piece.plan;

  const [shot, setShot] = useState(0);
  const [local, setLocal] = useState(-1);
  const [cam, setCam] = useState<Camera | null>(null);
  const [rings, setRings] = useState<Ring[]>([]);
  const takeRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const done = useRef(new Set<number>());
  const camRef = useRef<Camera | null>(null);
  const localRef = useRef(-1);
  const current = piece.shots[shot];
  const take = current.takes?.[ratio];

  const lens = useMemo<Lens>(
    () => ({ plan: piece.lens, lockedFrom: (tab) => lockedFromFor(piece.lens, tab), beatLimit: beatLimitFor(piece.lens), seePlan: () => {} }),
    [piece.lens],
  );

  /** The take's visible screen. */
  const screenEl = useCallback(() => takeRef.current?.querySelector<HTMLElement>('.vid-device[data-on] .vid-screen') ?? null, []);

  /** The first element matching `selector` (and, with `text`, whose label is that message). */
  const find = useCallback(
    (selector: string, text?: string) => {
      const want = text ? tl(text) : null;
      return [...(screenEl()?.querySelectorAll<HTMLElement>(selector) ?? [])].find((b) => !want || b.textContent?.trim() === want) ?? null;
    },
    [screenEl, tl],
  );

  const ringAt = useCallback((el: HTMLElement) => {
    const w = windowRef.current?.getBoundingClientRect();
    if (!w) return;
    const r = el.getBoundingClientRect();
    setRings((list) => [...list, { x: r.left + r.width / 2 - w.left, y: r.top + r.height / 2 - w.top, at: localRef.current }]);
  }, []);

  const run = useCallback(
    (step: Step) => {
      const host = takeRef.current;
      if (!host) return;
      // The SimBar of the screen the beats belong to: the desktop's when both are mounted (it is hidden on film).
      const sim = host.querySelector<HTMLElement>('.device-laptop .demo-sim') ?? host.querySelector<HTMLElement>('.demo-sim');
      if ('play' in step) sim?.querySelector<HTMLButtonElement>('.demo-sim-play')?.click();
      else if ('finish' in step) sim?.querySelector<HTMLButtonElement>(`.demo-sim-icon[aria-label="${CSS.escape(tk('sim.skip'))}"]`)?.click();
      else if ('nav' in step) {
        const label = tl(`nav.${step.nav}`);
        const items = screenEl()?.querySelectorAll<HTMLButtonElement>('button') ?? [];
        [...items].find((b) => (b.querySelector('.demo-side-label, .demo-navlabel')?.textContent ?? '').trim() === label)?.click();
      } else if ('scroll' in step) {
        const content = screenEl()?.querySelector<HTMLElement>('.demo-content');
        if (content) content.scrollTop = step.scroll === 'top' ? 0 : content.scrollHeight;
      } else if ('ring' in step) {
        const el = find(step.ring, step.text);
        if (el) ringAt(el);
      } else if ('click' in step) {
        const el = find(step.click, step.text);
        if (!el) return;
        if (step.tap) ringAt(el);
        el.click();
      }
    },
    [find, ringAt, screenEl, tk, tl],
  );

  const subtitleText = useCallback(
    (s: PieceShot): string | null => {
      const readout = s.readout?.(x).replace(/\n/g, ' · ') ?? null;
      if (s.kind === 'close') return `${plan ? planInfo(plan).name : t('brand')} · ${t(`${piece.id}.close`)}`;
      const words = s.headline ? t(`${piece.id}.headline`) : s.caption ? t(`${piece.id}.shots.${s.id}`) : null;
      return [readout, words].filter(Boolean).join(' · ') || null;
    },
    [piece.id, plan, t, x],
  );

  const api = useMemo<StageApi>(
    () => ({
      plan: {
        piece: piece.id,
        ratio,
        width: format.width,
        height: format.height,
        fps: FPS,
        duration: piece.shots[piece.shots.length - 1].end,
        shots: piece.shots.map((s) => ({ id: s.id, start: s.start, end: s.end })),
      },
      async enter(i) {
        done.current = new Set();
        camRef.current = null;
        localRef.current = -prerollOf(piece.shots[i], ratio);
        flushSync(() => {
          setShot(i);
          setCam(null);
          setRings([]);
          setLocal(localRef.current);
        });
        await settle(12);
        return prerollOf(piece.shots[i], ratio);
      },
      async tick(i, at, virtual) {
        const s = piece.shots[i];
        localRef.current = at;
        flushSync(() => setLocal(at));
        (s.takes?.[ratio]?.steps ?? []).forEach((st, n) => {
          if (st.at <= at && !done.current.has(n)) {
            done.current.add(n);
            run(st);
          }
        });
        await settle();
        // The camera frames the shot on its first frame (the take is where the shot starts) and stays.
        const tk2 = s.takes?.[ratio];
        const scr = screenEl();
        if (at >= 0 && tk2 && scr && windowRef.current && !camRef.current) {
          const box = scr.getBoundingClientRect();
          const scale = box.width / scr.offsetWidth || 1;
          const el = tk2.frame ? (scr.querySelector<HTMLElement>(tk2.frame) ?? scr) : scr;
          const r = el.getBoundingClientRect();
          const pad = tk2.pad ?? 0;
          const target = { x: (r.left - box.left) / scale - pad, y: (r.top - box.top) / scale - pad, w: r.width / scale + 2 * pad, h: r.height / scale + 2 * pad };
          const size = tk2.view === 'laptop' ? SCREEN.laptop : SCREEN.phone;
          const next = frameCamera(target, size, windowRef.current.clientWidth, windowRef.current.clientHeight, { align: tk2.align, cover: tk2.fit === 'cover', zoom: tk2.zoom });
          camRef.current = next;
          flushSync(() => setCam(next));
        }
        syncAnimations(virtual);
      },
      cues() {
        const out: { at: number; name: SoundName }[] = [];
        for (const s of piece.shots) for (const st of s.takes?.[ratio]?.steps ?? []) if ('sound' in st && st.sound && st.at >= 0) out.push({ at: s.start + st.at, name: st.sound });
        return out.sort((a, b) => a.at - b.at);
      },
      renderAudio: (duration, list) => renderMix(duration, list, piece.id),
      subtitles() {
        // Each cue starts when its words appear on screen and lasts until the cut.
        const cues = cuesFor(piece.shots, (s) => subtitleText(s as PieceShot));
        return { vtt: toVtt(cues), problems: checkCues(cues) };
      },
    }),
    [piece, ratio, format, run, screenEl, subtitleText],
  );

  useEffect(() => {
    window.__video = api;
    return () => {
      if (window.__video === api) delete window.__video;
    };
  }, [api]);

  const dur = current.end - current.start;
  const at = Math.max(0, local);
  const captionText = current.headline ? t(`${piece.id}.headline`) : current.caption ? t(`${piece.id}.shots.${current.id}`) : null;
  const readout = current.readout?.(x) ?? null;
  const textIn = tween(at, current.captionAt ?? 300, 600, 'expoOut');
  const phase = plan ? planPhase(plan) : 1;
  const closeIn = (d: number) => tween(at, d, 700, 'expoOut');

  let body: ReactNode;
  if (current.kind === 'ui' && take) {
    body = (
      <>
        <div className="vid-window" ref={windowRef} data-view={take.view}>
          <div className="vid-cam" style={cam ? cameraStyle(cam, take.push ?? 0, at, dur) : { opacity: 0 }}>
            <div ref={takeRef} className="vid-take">
              <LensProvider value={lens}>
                <TakeScreens key={shot} take={take} />
              </LensProvider>
            </div>
          </div>
          {current.dark ? <div aria-hidden className="vid-dark" style={{ clipPath: `inset(0 0 0 ${(100 * tween(at, current.dark.at, TIME.reveal, 'expoInOut')).toFixed(3)}%)` }} /> : null}
          {rings.map((r, n) => {
            const p = tween(at, r.at, TIME.ui + 160, 'expoOut');
            return <span key={n} aria-hidden className="vid-ring" style={{ left: r.x, top: r.y, opacity: (1 - p).toFixed(3), transform: `translate(-50%, -50%) scale(${lerp(0.55, 1.15, p).toFixed(3)})` }} />;
          })}
        </div>
        <div className="vid-copy">
          {readout ? (
            <p className="vid-readout" style={{ opacity: tween(at, 120, 500, 'soft').toFixed(3) }}>
              {readout}
            </p>
          ) : null}
          {captionText ? (
            <p className={current.headline ? 'vid-headline' : 'vid-caption'} style={{ opacity: textIn.toFixed(3), transform: `translateY(${lerp(0.35, 0, textIn).toFixed(3)}em)` }}>
              {captionText}
            </p>
          ) : null}
        </div>
      </>
    );
  } else {
    body = (
      <div className="vid-close">
        <div className="vid-close-glyph" style={{ clipPath: `circle(${lerp(0, 75, tween(at, 100, TIME.reveal, 'expoOut')).toFixed(3)}% at 50% 50%)` }}>
          <PhaseGlyph phase={phase} size="100%" strokeWidth={0.6} />
        </div>
        <p className="vid-close-plan" style={{ opacity: closeIn(350).toFixed(3), transform: `translateY(${lerp(0.25, 0, closeIn(350)).toFixed(3)}em)` }}>
          {plan ? planInfo(plan).name : t('brand')}
        </p>
        <p className="vid-close-lines" style={{ opacity: closeIn(650).toFixed(3) }}>
          {t(`${piece.id}.close`)}
        </p>
      </div>
    );
  }

  return (
    <div className="vid theme-dark" data-ratio={ratio} data-kind={current.kind} style={{ width: format.width, height: format.height }}>
      <div aria-hidden className="vid-light" />
      <header className="vid-top">
        {current.kind === 'ui' ? (
          <span className="vid-mark">
            <PhaseGlyph phase={phase} size="0.9em" />
            <span>{t('brand')}</span>
            {plan ? <span className="vid-mark-plan">{planInfo(plan).name}</span> : null}
          </span>
        ) : (
          <span />
        )}
        <span className="vid-seal">{t('seal')}</span>
      </header>
      {body}
    </div>
  );
}
