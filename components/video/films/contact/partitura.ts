import type { Line, Score } from '../../score/arreglo';

/**
 * EstateOS · Contact — the score (STORYBOARD.md · Música). 120 BPM, one bar = 2 s. D major, the song progression
 * D – A – Bm – G (I – V – vi – IV); the open in Bm – G (the problem), the setup lifted to Bm – G – D – A.
 *
 * The hook is the motif of the brand: six notes, one per phase of the eclipse (D E F# A B D), climbing to the octave
 * and answered on the way down. The reveal plays it once on the piano; the chorus sings it; the end signs with it.
 * Every section boundary falls on a bar, and every word slam on a beat (tests/video.test.ts).
 */

// midi: D4 62 · E4 64 · F#4 66 · G4 67 · A4 69 · B4 71 · C#5 73 · D5 74 · E5 76 · F#5 78 · G5 79 · A5 81 · B5 83 · C#6 85 · D6 86
const MOTIVO: Line = [[0, 0, 74, 2], [0, 2, 76, 2], [0, 4, 78, 2], [0, 6, 81, 2], [0, 8, 83, 2], [0, 10, 86, 6]];

const VERSO: Line = [
  [0, 0, 66, 4, 0.6], [0, 4, 69, 2, 0.6], [0, 6, 74, 6, 0.65],
  [1, 0, 73, 4, 0.6], [1, 4, 71, 2, 0.55], [1, 6, 69, 6, 0.6],
  [2, 0, 71, 4, 0.6], [2, 4, 74, 2, 0.6], [2, 6, 78, 6, 0.7],
  [3, 0, 76, 4, 0.65], [3, 4, 74, 4, 0.6], [3, 8, 71, 4, 0.55], [3, 12, 69, 4, 0.55],
  [4, 0, 66, 4, 0.6], [4, 4, 69, 2, 0.6], [4, 6, 74, 4, 0.65], [4, 10, 76, 2, 0.65], [4, 12, 78, 4, 0.7],
  [5, 0, 76, 8, 0.7], [5, 8, 73, 6, 0.65],
];

const GANCHO_A: Line = [[0, 0, 74, 2], [0, 2, 76, 2], [0, 4, 78, 2], [0, 6, 81, 2], [0, 8, 83, 2], [0, 10, 86, 6, 0.9]];
const GANCHO_B: Line = [[0, 0, 85, 2], [0, 2, 83, 2], [0, 4, 81, 4], [0, 8, 76, 2], [0, 10, 78, 2], [0, 12, 76, 4]];
const GANCHO_C: Line = [[0, 0, 74, 2], [0, 2, 76, 2], [0, 4, 78, 2], [0, 6, 81, 2], [0, 8, 83, 4], [0, 12, 81, 2], [0, 14, 78, 2]];
const GANCHO_D: Line = [[0, 0, 79, 4], [0, 4, 78, 2], [0, 6, 76, 2], [0, 8, 74, 8]];
const SUBE: Line = [[0, 0, 79, 4], [0, 4, 81, 4], [0, 8, 83, 4], [0, 12, 85, 4, 0.9]];
const at = (bar: number, line: Line): Line => line.map(([b, p, m, l, v]) => [b + bar, p, m, l, v]);

const CORO: Line = [...at(0, GANCHO_A), ...at(1, GANCHO_B), ...at(2, GANCHO_C), ...at(3, GANCHO_D), ...at(4, GANCHO_A), ...at(5, GANCHO_B), ...at(6, SUBE)];

const VERSO2: Line = [
  [0, 0, 74, 2], [0, 2, 78, 2], [0, 4, 83, 6], [0, 10, 81, 2], [0, 12, 78, 4],
  [1, 0, 79, 2], [1, 2, 83, 2], [1, 4, 86, 6], [1, 10, 83, 2], [1, 12, 81, 4],
  [2, 0, 78, 4], [2, 4, 81, 4], [2, 8, 86, 8, 0.9],
  [3, 0, 85, 4], [3, 4, 83, 2], [3, 6, 81, 2], [3, 8, 76, 8],
  [4, 0, 74, 2], [4, 2, 78, 2], [4, 4, 83, 4], [4, 8, 81, 4], [4, 12, 78, 4],
  [5, 0, 79, 4], [5, 4, 81, 4], [5, 8, 83, 4], [5, 12, 85, 4, 0.9],
];

/** The break: one note per word (48, 49, 50, 51), climbing to the leading tone; the D lands at 52. */
const QUIEBRE: Line = [[0, 0, 83, 8, 0.75], [0, 8, 81, 8, 0.7], [1, 0, 81, 4, 0.75], [1, 4, 83, 4, 0.8], [1, 8, 85, 8, 0.85]];

/** The signature: the six phases once more, the last one held to the end. */
const FIRMA: Line = [[0, 0, 74, 2, 0.7], [0, 2, 76, 2, 0.72], [0, 4, 78, 2, 0.74], [0, 6, 81, 2, 0.76], [0, 8, 83, 2, 0.8], [0, 10, 86, 20, 0.85]];

export const PARTITURA: Score = {
  bpm: 120,
  sections: [
    { from: 0, to: 4, style: 'gancho', chords: ['Bm', 'G'] },
    { from: 4, to: 6, style: 'marca', chords: ['D'], melody: MOTIVO },
    { from: 6, to: 18, style: 'verso', chords: ['D', 'A', 'Bm', 'G', 'D', 'A'], melody: VERSO },
    { from: 18, to: 20, style: 'subida', chords: ['A'] },
    { from: 20, to: 34, style: 'coro', chords: ['D', 'A', 'Bm', 'G', 'D', 'A', 'G'], melody: CORO },
    { from: 34, to: 36, style: 'subida', chords: ['A'] },
    { from: 36, to: 48, style: 'verso2', chords: ['Bm', 'G', 'D', 'A', 'Bm', 'G'], melody: VERSO2 },
    { from: 48, to: 52, style: 'quiebre', chords: ['G', 'A'], melody: QUIEBRE },
    { from: 52, to: 56, style: 'final', chords: ['D', 'D'], melody: FIRMA },
  ],
};
