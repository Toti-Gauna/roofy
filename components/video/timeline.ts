/**
 * The video factory's pure side (lote V1, guía de motion v1 §2–§7): the site's curves, the formats, the
 * shot list's reading rules and the WebVTT the player loads. No DOM and no React, so every rule here is
 * tested (tests/video.test.ts) and a piece can be checked before a single frame is rendered.
 *
 * A video is a pure function of its time `t` (ms): the stage computes every overlay style from `t` with
 * these curves, and the driver (scripts/render-video.mjs) moves the real demo with a simulated clock, so
 * the same command renders the same frames every time.
 */

/* ------------------------------------------------------------------ */
/* Curves (the site's, §2: never invent another one)                     */
/* ------------------------------------------------------------------ */

/** A CSS `cubic-bezier(x1, y1, x2, y2)` as a function of progress (0–1). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (p: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const x = (s: number) => ((ax * s + bx) * s + cx) * s;
  const y = (s: number) => ((ay * s + by) * s + cy) * s;
  const dx = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
  return (p: number) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    // Newton first (fast), bisection when the slope is too flat to trust.
    let s = p;
    for (let i = 0; i < 8; i++) {
      const err = x(s) - p;
      if (Math.abs(err) < 1e-6) return y(s);
      const d = dx(s);
      if (Math.abs(d) < 1e-6) break;
      s -= err / d;
    }
    let lo = 0;
    let hi = 1;
    s = p;
    for (let i = 0; i < 40; i++) {
      const v = x(s);
      if (Math.abs(v - p) < 1e-6) break;
      if (v < p) lo = s;
      else hi = s;
      s = (lo + hi) / 2;
    }
    return y(s);
  };
}

export const EASE = {
  /** Entrances and the interface's answers. */
  expoOut: cubicBezier(0.16, 1, 0.3, 1),
  /** Light that opens or closes. */
  expoInOut: cubicBezier(0.87, 0, 0.13, 1),
  /** The virtual camera. */
  inOut: cubicBezier(0.65, 0, 0.35, 1),
  /** Fades. */
  soft: cubicBezier(0.33, 1, 0.68, 1),
} as const;
export type EaseName = keyof typeof EASE;

/** Progress (0–1, eased) of a tween that starts at `start` and lasts `dur` ms, read at time `t`. */
export function tween(t: number, start: number, dur: number, ease: EaseName = 'expoOut'): number {
  if (dur <= 0) return t >= start ? 1 : 0;
  return EASE[ease](Math.min(1, Math.max(0, (t - start) / dur)));
}

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/* ------------------------------------------------------------------ */
/* Time tokens (§2) and formats (§6)                                     */
/* ------------------------------------------------------------------ */

export const TIME = {
  /** Shot change: a dry cut or a short fade. */
  cut: 200,
  /** The interface's answer, and the touch indicator. */
  ui: 220,
  /** Occultation: a disc or an edge uncovers the shot. */
  reveal: 800,
  /** Numbers that roll like an instrument. */
  readout: 900,
  /** Pause after an important action, before the cut. */
  breath: 500,
  /** Minimum hold of a line of ≤ 6 words. */
  lineHold: 1200,
  /** Reading ceiling: words per second. */
  wordsPerSecond: 2.2,
} as const;

export type Ratio = '16x9' | '9x16';
export const RATIOS: readonly Ratio[] = ['16x9', '9x16'];

export interface Format {
  /** Master (PNG per frame). */
  width: number;
  height: number;
  /** Web delivery (H.264). */
  deliver: { width: number; height: number };
  /** Weight target of a plan's video (bytes). */
  maxBytes: number;
}

export const FORMATS: Record<Ratio, Format> = {
  '16x9': { width: 1920, height: 1080, deliver: { width: 1920, height: 1080 }, maxBytes: 6 * 1024 * 1024 },
  '9x16': { width: 1080, height: 1920, deliver: { width: 720, height: 1280 }, maxBytes: 3 * 1024 * 1024 },
};

/**
 * Frames per second. V1 measured it (docs/video-factory.md): the camera drifts ≤ 4 % per shot, so a pan
 * moves under 1 px per frame at 30 fps and 60 only doubled the render time and the weight.
 */
export const FPS = 30;

/* ------------------------------------------------------------------ */
/* Shots and their words                                                  */
/* ------------------------------------------------------------------ */

export interface Shot {
  id: string;
  /** ms from the start of the video. */
  start: number;
  end: number;
  /** Key of the line under `video.<piece>.shots.<id>` shown on screen (and in the subtitles), if any. */
  caption?: boolean;
  /** When the line enters, ms after the shot starts. */
  captionAt?: number;
}

export const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

/** How long a line must stay on screen (§2 hold-texto): 1.2 s per 6 words, and never faster than 2.2 words/s. */
export function minHold(text: string): number {
  const n = words(text);
  if (!n) return 0;
  return Math.max(TIME.lineHold * Math.ceil(n / 6), (n / TIME.wordsPerSecond) * 1000);
}

export interface Problem {
  shot: string;
  rule: string;
}

/**
 * Checks a shot list: contiguous from 0, each caption held long enough to read, every shot within
 * 2.5–5 s unless it carries more than one action (`longShots`), and the total within the piece's window.
 */
export function checkShots(
  shots: readonly Shot[],
  text: (shot: Shot) => string | null,
  { total, tolerance, longShots = [] }: { total: number; tolerance: number; longShots?: readonly string[] },
): Problem[] {
  const out: Problem[] = [];
  let at = 0;
  for (const s of shots) {
    if (s.start !== at) out.push({ shot: s.id, rule: `starts at ${s.start}, expected ${at}` });
    at = s.end;
    const len = s.end - s.start;
    if (!longShots.includes(s.id) && (len < 2500 || len > 5000)) out.push({ shot: s.id, rule: `lasts ${len} ms (2500–5000)` });
    const line = text(s);
    if (line) {
      const shown = len - (s.captionAt ?? 0);
      const need = minHold(line);
      if (shown < need) out.push({ shot: s.id, rule: `line shown ${shown} ms, needs ${Math.round(need)} ms` });
    }
  }
  if (Math.abs(at - total) > tolerance) out.push({ shot: '*', rule: `lasts ${at} ms (${total} ± ${tolerance})` });
  return out;
}

/* ------------------------------------------------------------------ */
/* Subtitles (§3): WebVTT, ≤ 2 lines of ≤ 42 characters, ≤ 15 characters/s */
/* ------------------------------------------------------------------ */

export const SUB = { maxLine: 42, maxLines: 2, maxCps: 15 } as const;

/** Breaks a line in two (≤ 42 each) as evenly as the words allow; null when it can't fit in two. */
export function wrapCue(text: string, max: number = SUB.maxLine): string[] | null {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return [clean];
  const parts = clean.split(' ');
  let best: string[] | null = null;
  for (let i = 1; i < parts.length; i++) {
    const a = parts.slice(0, i).join(' ');
    const b = parts.slice(i).join(' ');
    if (a.length > max || b.length > max) continue;
    if (!best || Math.abs(a.length - b.length) < Math.abs(best[0].length - best[1].length)) best = [a, b];
  }
  return best;
}

export interface Cue {
  start: number;
  end: number;
  text: string;
}

/** Problems of a cue list (length, lines, reading speed, overlaps). */
export function checkCues(cues: readonly Cue[]): string[] {
  const out: string[] = [];
  cues.forEach((c, i) => {
    const lines = wrapCue(c.text);
    if (!lines) out.push(`cue ${i + 1} does not fit in ${SUB.maxLines} lines of ${SUB.maxLine}`);
    const cps = c.text.replace(/\s+/g, ' ').trim().length / ((c.end - c.start) / 1000);
    if (cps > SUB.maxCps) out.push(`cue ${i + 1} reads at ${cps.toFixed(1)} characters/s`);
    if (i > 0 && c.start < cues[i - 1].end) out.push(`cue ${i + 1} overlaps the previous one`);
  });
  return out;
}

const stamp = (ms: number) => {
  const total = Math.max(0, Math.round(ms));
  const h = Math.floor(total / 3_600_000);
  const m = Math.floor((total % 3_600_000) / 60_000);
  const s = Math.floor((total % 60_000) / 1000);
  const f = total % 1000;
  const two = (n: number) => String(n).padStart(2, '0');
  return `${two(h)}:${two(m)}:${two(s)}.${String(f).padStart(3, '0')}`;
};

/** A WebVTT file from cues (each wrapped in ≤ 2 lines). */
export function toVtt(cues: readonly Cue[]): string {
  const body = cues.map((c, i) => `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${(wrapCue(c.text) ?? [c.text]).join('\n')}`);
  return `WEBVTT\n\n${body.join('\n\n')}\n`;
}

/** The cues of a piece: one per captioned shot, from when its line enters until the shot ends. */
export function cuesFor(shots: readonly Shot[], text: (shot: Shot) => string | null): Cue[] {
  const cues: Cue[] = [];
  for (const s of shots) {
    const line = text(s);
    if (line) cues.push({ start: s.start + (s.captionAt ?? 0), end: s.end, text: line });
  }
  return cues;
}
