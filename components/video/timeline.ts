/**
 * The trailers' pure side (guía de motion v1 §0, §2, §3, §6): reading rules, subtitles (WebVTT) and the delivery
 * formats. No DOM and no React, so every rule here is tested (tests/video.test.ts) before a frame is rendered. The
 * motion itself lives on each film's GSAP timeline (components/video/films/).
 */

/** Reading (§2): a line of ≤ 6 words stays at least 1.2 s; never more than 2.2 words per second. */
export const TIME = { lineHold: 1200, wordsPerSecond: 2.2 } as const;

export type Ratio = '16x9' | '9x16';

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

export const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

/** How long a line must stay on screen (§2 hold-texto): 1.2 s per 6 words, and never faster than 2.2 words/s. */
export function minHold(text: string): number {
  const n = words(text);
  if (!n) return 0;
  return Math.max(TIME.lineHold * Math.ceil(n / 6), (n / TIME.wordsPerSecond) * 1000);
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
