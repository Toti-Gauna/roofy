/**
 * EstateOS · Contact — the score (STORYBOARD.md · Música). 120 BPM, one bar = 2 s, sixteenths of 0.125 s. Pop in
 * D major, the key of the site's music. Styles are Kinetic Studio's (kinetic/recipes-music.js): 'hit', 'latido',
 * 'coro', 'verso', 'subida', 'quiebre', 'final'.
 *
 * The motif: six notes, one per phase of the eclipse (D E F# A B D, the D major pentatonic climbing to the octave),
 * answered on the way down. The signature at the end climbs the six an octave higher.
 */
const D = [50, 54, 57]; // D3 F#3 A3
const A = [45, 49, 52]; // A2 C#3 E3
const Bm = [47, 50, 54]; // B2 D3 F#3
const G = [43, 47, 50]; // G2 B2 D3

/** [sixteenth, midi, length in sixteenths] over four bars (D – A – Bm – G). */
const MOTIVO = [
  [0, 74, 2], [2, 76, 2], [4, 78, 2], [6, 81, 2], [8, 83, 2], [10, 86, 6],
  [16, 83, 2], [18, 81, 2], [20, 78, 8],
  [32, 74, 2], [34, 76, 2], [36, 78, 2], [38, 81, 2], [40, 83, 2], [42, 86, 4], [46, 88, 6],
  [48, 86, 2], [50, 83, 2], [52, 81, 2], [54, 78, 2], [56, 74, 8],
];
const LLAMADO = [[0, 74, 2], [2, 76, 2], [4, 78, 2], [6, 81, 2], [8, 83, 2], [10, 86, 6]];
const FIRMA = [[0, 86, 1], [1, 88, 1], [2, 90, 1], [3, 93, 1], [4, 95, 1], [5, 98, 12]];

export const PARTITURA = {
  bpm: 120,
  volume: 0.85,
  parts: [
    { from: 0, style: 'hit', chords: [Bm], volume: 0.8 },
    { from: 0, to: 4, style: 'latido', anchor: 0, chords: [Bm, G] },
    { from: 4, style: 'hit', chords: [D], volume: 0.9 },
    { from: 4, to: 6, style: 'coro', chords: [D], hook: LLAMADO, volume: 0.8 },
    { from: 6, to: 18, style: 'verso', chords: [D, A, Bm, G], answer: true },
    { from: 18, to: 20, style: 'subida', chords: [A] },
    { from: 20, style: 'hit', chords: [D] },
    { from: 20, to: 34, style: 'coro', chords: [D, A, Bm, G], hook: MOTIVO, hookVol: 0.06, volume: 1.05 },
    { from: 34, to: 36, style: 'subida', chords: [A] },
    { from: 36, style: 'hit', chords: [D] },
    { from: 36, to: 48, style: 'verso', chords: [D, A, Bm, G], full: true, answer: true },
    { from: 48, to: 52, style: 'quiebre', chords: [G], hook: MOTIVO, hookVol: 0.07 },
    { from: 52, style: 'hit', chords: [D] },
    { from: 52, to: 54, style: 'coro', chords: [D], lleno: true, volume: 1.15 },
    { from: 54, to: 56, style: 'final', chords: [D], hook: FIRMA, hookVol: 0.05 },
  ],
};
