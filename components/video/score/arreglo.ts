import type { Inst, Note } from './orquesta';

/**
 * From a film's score (sections, chords and melodies) to the orchestra's notes. Pure, so the tests can read the
 * music: where it hits, what plays the melody, that it covers the whole film. One bar = 4 beats = 16 sixteenths.
 *
 * Styles, by what the picture needs:
 * - `gancho`  the cold open: a low stab, a kick and a sub on every word slam, strings swelling under it.
 * - `marca`   the reveal: an impact, the chord blooming in the strings, the motif climbing on the piano.
 * - `verso`   the app scenes: the piano comping, a held bass, a light kit (kick, snaps, shaker), the lead singing.
 * - `subida`  the bar into a drop: a snare roll that speeds up, a riser, the bass pedalling; the last sixteenth silent.
 * - `coro`    the drop: four on the floor, claps, hats, the bass driving in eighths, the arpeggio, the hook doubled
 *             by the glockenspiel, and the pump.
 * - `verso2`  the lifted verse: fuller kit, piano in eighths, strings carrying the melody with the lead.
 * - `quiebre` the break: no kit; a stab, a kick and a sub on each word, the hook on the piano, a reverse cymbal in.
 * - `final`   the last chord: an impact, the full chord held, the signature on the glockenspiel, silence by the end.
 */

export type Chord = 'D' | 'A' | 'Bm' | 'G' | 'Em' | 'F#m';
/** Pitch classes, root first. */
const PCS: Record<Chord, number[]> = { D: [2, 6, 9], A: [9, 1, 4], Bm: [11, 2, 6], G: [7, 11, 2], Em: [4, 7, 11], 'F#m': [6, 9, 1] };

export type Style = 'gancho' | 'marca' | 'verso' | 'subida' | 'coro' | 'verso2' | 'quiebre' | 'final';

/** [bar, sixteenth, midi, length in sixteenths, velocity?] from the section's start. */
export type Line = [number, number, number, number, number?][];

export interface Section {
  from: number;
  to: number;
  style: Style;
  /** One chord per bar. */
  chords: Chord[];
  /** The melody (the lead; in `quiebre` and `marca` the piano). */
  melody?: Line;
}

export interface Score {
  bpm: number;
  sections: Section[];
}

const mod = (a: number, n: number) => ((a % n) + n) % n;
/** Each pitch class of the chord in [lo, lo + 12), low to high. */
const inRange = (pcs: number[], lo: number) => pcs.map((pc) => lo + mod(pc - lo, 12)).sort((a, b) => a - b);
const bassRoot = (c: Chord) => 36 + mod(PCS[c][0] - 36, 12); // C2 … B2
const padVoicing = (c: Chord) => {
  const [r, third, fifth] = PCS[c];
  const root = 48 + mod(r - 48, 12);
  return [root, root + mod(fifth - r, 12), root + 12, root + 12 + mod(third - r, 12)];
};
const keysVoicing = (c: Chord) => inRange(PCS[c], 57);

export function arrange(score: Score): Note[] {
  const beat = 60 / score.bpm;
  const s16 = beat / 4;
  const bar = 16 * s16;
  const out: Note[] = [];
  const add = (inst: Inst, t: number, dur: number, vel: number, midi?: number, pump?: boolean) => out.push({ t, inst, dur, vel, midi, pump });

  for (const sec of score.sections) {
    const bars = Math.round((sec.to - sec.from) / bar);
    for (let b = 0; b < bars; b++) {
      const c = sec.chords[Math.min(b, sec.chords.length - 1)];
      const t0 = sec.from + b * bar;
      const at = (pos: number) => t0 + pos * s16;
      const root = bassRoot(c);
      const last = b === bars - 1;

      switch (sec.style) {
        case 'gancho': {
          // A word every two beats: a stab, a kick and a sub on each.
          for (const pos of [0, 8]) {
            add('kick', at(pos), 0.4, 0.9);
            add('impact', at(pos), 1, pos === 0 && b === 0 ? 0.7 : 0.35);
            add('bass', at(pos), 0.9, 0.8, root);
            keysVoicing(c).forEach((m) => add('keys', at(pos), 0.8, 0.75, m - 12));
          }
          padVoicing(c).forEach((m) => add('strings', t0, bar + 0.05, 0.5 + 0.3 * b, m));
          if (last) {
            add('riser', at(8), 4 * beat * 0.5, 0.8);
            add('reverse', at(12), beat, 0.9);
          }
          break;
        }
        case 'marca': {
          add('impact', t0, 1.4, 1);
          add('crash', t0, 2, 0.9);
          add('kick', t0, 0.4, 1);
          add('bass', t0, bar * 0.95, 0.85, root);
          padVoicing(c).forEach((m) => add('strings', t0, bar + 0.1, 0.8, m));
          keysVoicing(c).forEach((m) => add('keys', t0, bar, 0.6, m));
          break;
        }
        case 'verso': {
          for (const pos of [0, 10]) add('kick', at(pos), 0.4, pos ? 0.6 : 0.8);
          for (const pos of [4, 12]) add('clap', at(pos), 0.2, 0.42);
          for (let p = 0; p < 16; p++) add('shaker', at(p), 0.06, p % 2 ? 0.55 : 0.85);
          add('bass', t0, bar * 0.72, 0.75, root);
          add('bass', at(12), 3 * s16, 0.55, root + 7 > 47 ? root - 5 : root + 7);
          // The piano comps on 1, the "and" of 2 and the "and" of 3.
          for (const [pos, d, v] of [[0, 6, 0.6], [6, 4, 0.42], [10, 6, 0.5]] as const) keysVoicing(c).forEach((m) => add('keys', at(pos), d * s16, v, m));
          padVoicing(c).forEach((m) => add('strings', t0, bar + 0.05, 0.4, m));
          break;
        }
        case 'subida': {
          add('riser', t0, bar - s16, 1);
          add('reverse', t0 + bar - beat, beat - 0.01, 1);
          for (let p = 0; p < 15; p++) {
            const x = p / 15;
            if (p < 8 ? p % 2 === 0 : true) add('snare', at(p), 0.15, 0.25 + 0.65 * x);
            if (p % 4 === 0) add('kick', at(p), 0.4, 0.5 + 0.4 * x);
            if (p % 2 === 0) add('bass', at(p), 1.5 * s16, 0.5 + 0.35 * x, root);
          }
          padVoicing(c).forEach((m) => add('strings', t0, bar - s16, 0.75, m));
          break;
        }
        case 'coro': {
          if (b % 4 === 0) add('crash', t0, 2, 0.75);
          for (const pos of [0, 4, 8, 12]) add('kick', at(pos), 0.4, 0.95, undefined, true);
          for (const pos of [4, 12]) {
            add('clap', at(pos), 0.2, 0.75);
            add('snare', at(pos), 0.2, 0.45);
          }
          for (const pos of [2, 6, 10, 14]) add('openhat', at(pos), 0.2, 0.7);
          for (let p = 0; p < 16; p++) add('hat', at(p), 0.04, p % 2 ? 0.45 : 0.25);
          // The bass drives in eighths; the octave on the offbeats.
          for (let p = 0; p < 16; p += 2) add('bass', at(p), 1.6 * s16, p % 4 === 0 ? 0.85 : 0.7, p % 4 === 2 ? root + 12 : root);
          // The arpeggio climbs the chord in sixteenths.
          const arp = inRange(PCS[c], 62);
          const PAT = [0, 1, 2, 3, 2, 1, 2, 3];
          for (let p = 0; p < 16; p++) {
            const k = PAT[p % 8];
            add('pluck', at(p), s16, p % 4 === 0 ? 0.8 : 0.55, k === 3 ? arp[0] + 12 : arp[k]);
          }
          keysVoicing(c).forEach((m) => add('keys', t0, bar * 0.9, 0.45, m));
          padVoicing(c).forEach((m) => add('strings', t0, bar + 0.05, 0.7, m));
          break;
        }
        case 'verso2': {
          for (const pos of [0, 7, 8]) add('kick', at(pos), 0.4, pos === 7 ? 0.55 : 0.85);
          for (const pos of [4, 12]) add('clap', at(pos), 0.2, 0.6);
          for (const pos of [2, 6, 10, 14]) add('hat', at(pos), 0.04, 0.7);
          for (let p = 0; p < 16; p++) add('shaker', at(p), 0.06, p % 2 ? 0.5 : 0.8);
          add('bass', t0, 7 * s16, 0.8, root);
          add('bass', at(8), 5 * s16, 0.7, root);
          add('bass', at(14), 2 * s16, 0.55, root + 7 > 47 ? root - 5 : root + 7);
          for (let p = 0; p < 16; p += 2) keysVoicing(c).forEach((m) => add('keys', at(p), 1.5 * s16, p % 8 === 0 ? 0.45 : 0.3, m));
          padVoicing(c).forEach((m) => add('strings', t0, bar + 0.05, 0.6, m));
          break;
        }
        case 'quiebre': {
          for (const pos of [0, 8]) {
            add('kick', at(pos), 0.4, 0.85);
            add('bass', at(pos), 0.95, 0.75, root);
            keysVoicing(c).forEach((m) => add('keys', at(pos), 0.9, 0.7, m));
          }
          padVoicing(c).forEach((m) => add('strings', t0, bar + 0.05, 0.75, m));
          if (last) add('reverse', t0 + bar - beat, beat - 0.01, 1);
          break;
        }
        case 'final': {
          if (b === 0) {
            const hold = sec.to - t0 - 0.5; // everything quiet before the last frame
            add('impact', t0, 1.6, 1);
            add('crash', t0, 2.4, 1);
            add('kick', t0, 0.4, 1);
            add('bass', t0, hold - 0.8, 0.8, root);
            padVoicing(c).forEach((m) => add('strings', t0, hold - 0.8, 0.85, m));
            [...keysVoicing(c), ...keysVoicing(c).map((m) => m + 12)].forEach((m) => add('keys', t0, hold - 0.6, 0.65, m));
          }
          break;
        }
      }
    }
    // The melody: the lead sings it; in the reveal and the break the piano plays it (a quieter, closer voice).
    const voice: Inst = sec.style === 'marca' || sec.style === 'quiebre' ? 'keys' : 'lead';
    for (const [b, pos, midi, len, vel = 0.8] of sec.melody ?? []) {
      const t = sec.from + b * bar + pos * s16;
      add(voice, t, len * s16 * (voice === 'lead' ? 0.95 : 1.4), vel, midi);
      if (sec.style === 'coro' || sec.style === 'final') add('glock', t, Math.min(1.2, len * s16), vel * 0.7, midi + 12);
      if (sec.style === 'verso2') add('strings', t, len * s16, vel * 0.45, midi - 12);
    }
  }
  return out.sort((a, b) => a.t - b.t);
}
