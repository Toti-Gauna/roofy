import type { SoundName } from '@/lib/sound/types';

/**
 * The video's sound (guía de motion v1 §7.4, §8): the site's own generative music and effects
 * (lib/sound/engine.ts), rendered in an OfflineAudioContext, so no audio file and no new license. The
 * engine draws its voicings and noise with `Math.random`; a seeded generator stands in while it renders,
 * so the same piece always gets the same mix. Effects go only on actions (the cues), never on cuts. The
 * driver then normalizes it to −16 LUFS with ffmpeg.
 */

const RATE = 48_000;

/** mulberry32: small, fast and good enough for music. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (text: string) => [...text].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);

/** A 16-bit PCM stereo WAV of the buffer, in base64. */
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

export async function renderMix(durationMs: number, cues: readonly { at: number; name: SoundName }[], seed: string): Promise<string> {
  const { createSoundEngine } = await import('@/lib/sound/engine');
  const seconds = durationMs / 1000;
  const ctx = new OfflineAudioContext(2, Math.ceil(RATE * seconds), RATE);
  const random = Math.random;
  Math.random = seeded(hash(seed));
  try {
    const engine = createSoundEngine(ctx, { autoSchedule: false });
    engine.setMusic(true);
    engine.pump(seconds + 2);
    // Each effect at its time: the render stops there, the effect is scheduled "now" and it goes on.
    const quantum = 128 / RATE;
    const seen = new Set<number>();
    for (const cue of cues) {
      const when = Math.round(cue.at / 1000 / quantum) * quantum;
      if (when <= 0 || when >= seconds || seen.has(when)) continue;
      seen.add(when);
      void ctx.suspend(when).then(() => {
        engine.play(cue.name);
        void ctx.resume();
      });
    }
    const buffer = await ctx.startRendering();
    return wavBase64(buffer);
  } finally {
    Math.random = random;
  }
}
