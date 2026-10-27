import './shim';
import './audio.js';
import './recipes-music.js';
import type { KineticD } from './shim';

/**
 * Kinetic Studio's sound on a trailer's GSAP timeline: `sfx` places a voice at a time (a zero-length callback,
 * as Kinetic's `D.sfx`), `score` places the whole music, and `renderAudio` plays every callback into an
 * OfflineAudioContext (seeded: same mix every run) and returns a 16-bit stereo WAV in base64.
 */
export type Sfx = (name: string, at: number, ...args: unknown[]) => void;

export function sfxOn(tl: gsap.core.Timeline): Sfx {
  return (name, at, ...args) => {
    tl.call(() => window.SFX?.play(tl.time() - at, name, args), undefined, at);
  };
}

export function score(tl: gsap.core.Timeline, music: unknown) {
  const D: KineticD = { tl, sfx: sfxOn(tl) };
  window.Trailer?.plugins.forEach((p) => p.done?.(D, { music }));
}

/** Every zero-length callback of the timeline with its absolute time, in order (Kinetic's `callbacks()`). */
function callbacks(tl: gsap.core.Timeline) {
  const list: { t: number; i: number; fn: () => void }[] = [];
  const walk = (x: gsap.core.Timeline, off: number) =>
    x.getChildren(false, true, true).forEach((c) => {
      const at = off + c.startTime();
      if ('getChildren' in c) walk(c as gsap.core.Timeline, at);
      else if (c.duration() === 0 && c.vars.onComplete) {
        const vars = c.vars;
        list.push({ t: at, i: list.length, fn: () => vars.onComplete!.apply(vars.callbackScope || c, vars.onCompleteParams || []) });
      }
    });
  walk(tl, 0);
  return list.sort((p, q) => p.t - q.t || p.i - q.i);
}

function wavBase64(buffer: AudioBuffer): string {
  const channels = buffer.numberOfChannels;
  const frames = buffer.length;
  const bytes = new ArrayBuffer(44 + frames * channels * 2);
  const view = new DataView(bytes);
  const text = (at: number, s: string) => [...s].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + frames * channels * 2, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, frames * channels * 2, true);
  const data = Array.from({ length: channels }, (_, c) => buffer.getChannelData(c));
  let at = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < channels; c++) {
      const v = Math.max(-1, Math.min(1, data[c][i]));
      view.setInt16(at, v < 0 ? v * 0x8000 : v * 0x7fff, true);
      at += 2;
    }
  }
  const u8 = new Uint8Array(bytes);
  let out = '';
  for (let i = 0; i < u8.length; i += 0x8000) out += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(out);
}

export async function renderAudio(tl: gsap.core.Timeline, seed = 1): Promise<string> {
  if (!window.SFX) throw new Error('Kinetic audio not loaded');
  const buffer = await window.SFX.render(tl.duration(), callbacks(tl), { sampleRate: 48_000, seed });
  return wavBase64(buffer);
}
