import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SUB, checkCues, minHold, toVtt, wrapCue, type Cue } from '@/components/video/timeline';
import { CONTACT_DURATION, COVERS, GOLPES, HEADS, HEAD_TIMES, contactTexts } from '@/components/video/films/contact/script';
import { PARTITURA } from '@/components/video/films/contact/partitura';
import { lockedFromFor } from '@/components/experience/lens';
import type { EstateTab } from '@/components/demos/real-estate/data';

type Tree = { [key: string]: Tree | string };
const load = (locale: string): Tree => JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8')) as Tree;
const at = (tree: Tree, path: string): string | null => {
  const v = path.split('.').reduce<Tree | string | undefined>((node, k) => (typeof node === 'object' ? node[k] : undefined), tree);
  return typeof v === 'string' ? v : null;
};
const strings = (tree: Tree): string[] => Object.values(tree).flatMap((v) => (typeof v === 'string' ? [v] : strings(v)));

describe('the words on screen (guía de motion v1 §2–§3)', () => {
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

describe('P1 · Contact (lote V1, the Kinetic way: guía de motion §0)', () => {
  const textsFor = (locale: string) => {
    const m = load(locale);
    const tc = (k: string) => at(m, `video.contact.${k}`) ?? `MISSING video.contact.${k}`;
    return contactTexts(tc, at(m, 'experience.plans.contact.tagline')!, at(m, 'video.brand')!, 'Contact');
  };

  it.each(['es', 'en', 'pt'])('%s: every word on screen exists, is held long enough and makes valid subtitles', (locale) => {
    const texts = textsFor(locale);
    expect(texts.filter((x) => x.text.includes('MISSING')).map((x) => x.text)).toEqual([]);
    for (const h of HEADS) {
      const [a, b] = HEAD_TIMES[h];
      const text = at(load(locale), `video.contact.heads.${h}`)!;
      expect((b - a) * 1000, `${locale} · ${h}: «${text}»`).toBeGreaterThanOrEqual(minHold(text));
    }
    expect(checkCues(texts.map((x) => ({ start: x.at * 1000, end: x.end * 1000, text: x.text })))).toEqual([]);
  });

  it('explains everything Contact delivers, area by area, and nothing it does not include', () => {
    const shown = new Set(Object.values(COVERS).flat());
    const tabs: EstateTab[] = ['today', 'inbox', 'contacts', 'pipeline', 'visits', 'tasks', 'followups', 'listings', 'site', 'brand', 'team'];
    // «Hoy» is the CRM's summary of the other areas, each one shown on its own.
    const summary: EstateTab[] = ['today'];
    for (const tab of tabs) {
      const open = lockedFromFor('contact', tab) === null;
      if (open && !summary.includes(tab)) expect(shown.has(tab), `${tab} is in Contact and the film never shows it`).toBe(true);
      if (!open) expect(shown.has(tab), `${tab} is not in Contact (it belongs in its own plan's video)`).toBe(false);
    }
    // One chapter per deliverable, in the order the storyboard tells them.
    expect(Object.keys(COVERS)).toEqual(['web', 'chat', 'crm', 'setup']);
  });

  it('keeps the tempo: 120 BPM, chapters and slams on the beat, the score covering the whole film', () => {
    const bar = (60 / PARTITURA.bpm) * 4;
    expect(PARTITURA.bpm).toBe(120);
    const spans = PARTITURA.parts.filter((p) => 'to' in p && p.to !== undefined) as { from: number; to: number }[];
    for (const p of PARTITURA.parts) expect(p.from % bar, `part at ${p.from}`).toBe(0);
    // The spans tile 0 → the end with no gap and no overlap.
    let t = 0;
    for (const p of [...spans].sort((a, b) => a.from - b.from)) {
      expect(p.from, `gap or overlap at ${t}`).toBe(t);
      t = p.to;
    }
    expect(t).toBe(CONTACT_DURATION);
    const beat = 60 / PARTITURA.bpm;
    for (const g of GOLPES) for (const w of g.words) expect(w.at % beat, `${g.scene}/${w.id}`).toBe(0);
    for (const h of HEADS) expect(HEAD_TIMES[h][0] % beat, h).toBeLessThanOrEqual(0.12);
  });

  it('shows no plan price, quota or AI inside the video (the price lives next to the player)', () => {
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
