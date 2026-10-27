'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useLocale, useTranslations } from 'next-intl';
import { planInfo } from '@/lib/plans';
import { renderAudio, sfxOn, type Stem } from './kinetic/score';
import { arrange } from './score/arreglo';
import { PARTITURA } from './films/contact/partitura';
import { LAYOUTS, type FilmCtx } from './film';
import { ContactFilm, buildContact } from './films/contact/ContactFilm';
import { CONTACT_DURATION, contactTexts } from './films/contact/script';
import { priceLines } from './price';
import { checkCues, toVtt, type Ratio } from './timeline';
import './ui/trailer.css';

/** What the render driver reads (scripts/render-video.mjs). */
export interface TrailerApi {
  duration: number;
  width: number;
  height: number;
  /** Shows the frame at `t` seconds (events suppressed: no sound while scrubbing). */
  seek(t: number): void;
  /** The music (the orchestra) and the interface sounds (Kinetic's engine), mixed offline: 16-bit stereo WAV in base64. */
  renderAudio(stem?: Stem): Promise<string>;
  /** The on-screen words as WebVTT in this page's language, and the rules they break. */
  subtitles(): { vtt: string; problems: string[] };
}

declare global {
  interface Window {
    trailer?: TrailerApi;
  }
}

/** Mounts a film at its stage size and builds its paused timeline (Kinetic's `?t=` seek, for the driver). */
export function FilmStage({ film, ratio }: { film: 'contact'; ratio: Ratio }) {
  const root = useRef<HTMLDivElement>(null);
  const tc = useTranslations('video.contact');
  const tv = useTranslations('video');
  const tx = useTranslations('experience');
  const locale = useLocale();
  const L = LAYOUTS[ratio];

  useLayoutEffect(() => {
    const el = root.current?.querySelector<HTMLElement>('.tr');
    if (!el) return;
    const tl = gsap.timeline({ paused: true });
    const ctx = gsap.context(() => {
      const c: FilmCtx = {
        tl,
        root: el,
        L,
        q: (sel) => Array.from(el.querySelectorAll<HTMLElement>(sel)),
        one: (sel) => {
          const found = el.querySelector<HTMLElement>(sel);
          if (!found) throw new Error(`film: nothing matches ${sel}`);
          return found;
        },
        sfx: sfxOn(tl),
      };
      if (film === 'contact') buildContact(c);
    }, el);
    tl.seek(0, true);
    // The subtitles carry the two amounts; the rate's date stays on screen only (it would read too fast).
    const price = priceLines((k, v) => tv(`price.${k}`, v), locale, planInfo('contact').priceUsdMonthly).slice(0, 2).join(' · ');
    const texts = () => contactTexts((k) => tc(k), tx('plans.contact.tagline'), tv('brand'), planInfo('contact').name, price);
    window.trailer = {
      duration: CONTACT_DURATION,
      width: L.W,
      height: L.H,
      seek: (t) => {
        tl.seek(Math.min(t, tl.duration()), true);
      },
      renderAudio: (stem) => renderAudio(tl, arrange(PARTITURA), stem),
      subtitles: () => {
        const cues = texts().map((x) => ({ start: x.at * 1000, end: x.end * 1000, text: x.text }));
        return { vtt: toVtt(cues), problems: checkCues(cues) };
      },
    };
    // ?t=SECONDS freezes a frame (as Kinetic's trailers).
    const t = Number(new URLSearchParams(window.location.search).get('t'));
    if (Number.isFinite(t) && t > 0) tl.seek(t, true);
    document.documentElement.dataset.trailer = 'ready';
    return () => {
      ctx.revert();
      tl.kill();
      delete window.trailer;
      delete document.documentElement.dataset.trailer;
    };
  }, [film, L, tc, tv, tx, locale]);

  useEffect(() => {
    document.body.style.margin = '0';
  }, []);

  return (
    <div ref={root} style={{ width: L.W, height: L.H }}>
      <ContactFilm ratio={ratio} L={L} />
    </div>
  );
}
