import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EASE, SUB, checkCues, checkShots, cubicBezier, cuesFor, minHold, toVtt, tween, wrapCue, type Cue, type Shot } from '@/components/video/timeline';
import { PIECES } from '@/components/video/pieces';
import type { PieceShot, Step } from '@/components/video/piece';
import { beatLimitFor } from '@/components/experience/lens';

type Tree = { [key: string]: Tree | string };
const load = (locale: string): Tree => JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8')) as Tree;
const at = (tree: Tree, path: string): string | null => {
  const v = path.split('.').reduce<Tree | string | undefined>((node, k) => (typeof node === 'object' ? node[k] : undefined), tree);
  return typeof v === 'string' ? v : null;
};
const strings = (tree: Tree): string[] => Object.values(tree).flatMap((v) => (typeof v === 'string' ? [v] : strings(v)));

describe('the factory’s curves and words (guía de motion v1 §2–§3)', () => {
  it('cubic-bezier matches the curve’s ends and is monotonic', () => {
    for (const ease of Object.values(EASE)) {
      expect(ease(0)).toBe(0);
      expect(ease(1)).toBe(1);
      let last = 0;
      for (let p = 0.02; p < 1; p += 0.02) {
        const v = ease(p);
        expect(v).toBeGreaterThanOrEqual(last - 1e-9);
        last = v;
      }
    }
    // The linear bezier is the identity; the site's expo-out is well past halfway at 30 % of the time.
    expect(cubicBezier(0.25, 0.25, 0.75, 0.75)(0.4)).toBeCloseTo(0.4, 4);
    expect(EASE.expoOut(0.3)).toBeGreaterThan(0.75);
  });

  it('tween clamps before and after, and a zero-length tween jumps', () => {
    expect(tween(0, 100, 500)).toBe(0);
    expect(tween(700, 100, 500)).toBe(1);
    expect(tween(100, 100, 0)).toBe(1);
  });

  it('a line is held long enough to read: 1.2 s per 6 words, never above 2.2 words/s', () => {
    expect(minHold('Oficina cerrada.')).toBe(1200);
    expect(minHold('Cada consulta tiene estado y próximo paso.')).toBeCloseTo((7 / 2.2) * 1000, 0);
  });

  it('subtitles wrap in two balanced lines of ≤ 42 characters, or report that they cannot', () => {
    expect(wrapCue('Corto.')).toEqual(['Corto.']);
    const two = wrapCue('Chat guiado: responde con botones, a cualquier hora.')!;
    expect(two).toHaveLength(2);
    for (const line of two) expect(line.length).toBeLessThanOrEqual(SUB.maxLine);
    expect(wrapCue('x'.repeat(90))).toBeNull();
    const fast: Cue[] = [{ start: 0, end: 1000, text: 'Demasiadas palabras para un segundo de pantalla.' }];
    expect(checkCues(fast).join()).toMatch(/characters\/s/);
    expect(toVtt([{ start: 300, end: 4000, text: 'Hola.' }])).toBe('WEBVTT\n\n1\n00:00:00.300 --> 00:00:04.000\nHola.\n');
  });
});

describe('P1 · Contact (lote V1)', () => {
  const piece = PIECES.contact;
  const lineOf = (locale: string) => {
    const m = load(locale);
    return (shot: Shot) => {
      const s = shot as PieceShot;
      return s.headline ? at(m, `video.contact.headline`) : s.caption ? at(m, `video.contact.shots.${s.id}`) : s.kind === 'close' ? at(m, 'video.contact.close') : null;
    };
  };

  it.each(['es', 'en', 'pt'])('%s: the cut holds every line long enough and lasts 35 s ± 5', (locale) => {
    expect(checkShots(piece.shots, lineOf(locale), piece)).toEqual([]);
    expect(checkCues(cuesFor(piece.shots, lineOf(locale)))).toEqual([]);
  });

  it('films only what Contact includes: its three beats, no follow-ups, no prices inside the video', () => {
    const limit = beatLimitFor('contact')!;
    for (const s of piece.shots) {
      for (const take of Object.values(s.takes ?? {})) {
        const steps: Step[] = take.steps;
        // Each take starts fresh: it can play at most the beats Contact's story has.
        expect(steps.filter((st) => 'play' in st).length, s.id).toBeLessThanOrEqual(limit);
        expect(steps.some((st) => 'nav' in st && st.nav === 'followups'), s.id).toBe(false);
      }
    }
    for (const locale of ['es', 'en', 'pt']) {
      const words = strings(load(locale).video as Tree);
      expect(words.filter((w) => /\b(USD|US\$|R\$|\$)\s?\d|\/mes|\/month|\/mês/i.test(w)), locale).toEqual([]);
      expect(words.filter((w) => /\b(IA|AI)\b|inteligencia artificial|artificial intelligence/i.test(w)), locale).toEqual([]);
    }
  });

  it('every frame says it is a demo with fictional data', () => {
    expect(at(load('es'), 'video.seal')).toBe('Demo · datos ficticios');
    for (const locale of ['en', 'pt']) expect(at(load(locale), 'video.seal')).toMatch(/^Demo · /);
  });
});
