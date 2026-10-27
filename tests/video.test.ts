import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SUB, checkCues, minHold, toVtt, wrapCue, type Cue } from '@/components/video/timeline';
import { CONTACT_DURATION, COVERS, GOLPES, HEADS, HEAD_TIMES, contactTexts } from '@/components/video/films/contact/script';
import { PARTITURA } from '@/components/video/films/contact/partitura';
import { arrange } from '@/components/video/score/arreglo';
import { lockedFromFor } from '@/components/experience/lens';
import { planInfo } from '@/lib/plans';
import { RATE_DATE, localAmount, priceLines } from '@/components/video/price';
import rates from '@/content/video-rates.json';
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
    const price = priceLines((k, v) => (at(m, `video.price.${k}`) ?? `MISSING video.price.${k}`).replace(/\{(\w+)\}/g, (_, x: string) => v[x]), locale, planInfo('contact').priceUsdMonthly);
    return contactTexts(tc, at(m, 'experience.plans.contact.tagline')!, at(m, 'video.brand')!, 'Contact', price.slice(0, 2).join(' · '));
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

  it('keeps the tempo: 120 BPM, sections on the bar, word slams and headlines on the beat', () => {
    const beat = 60 / PARTITURA.bpm;
    const bar = beat * 4;
    expect(PARTITURA.bpm).toBe(120);
    // The sections tile 0 → the end on bar lines, one chord per bar.
    let t = 0;
    for (const sec of PARTITURA.sections) {
      expect(sec.from, `gap or overlap at ${t}`).toBe(t);
      expect(sec.from % bar, `${sec.style} at ${sec.from}`).toBe(0);
      expect(sec.chords.length, `${sec.style} at ${sec.from}: one chord per bar`).toBe((sec.to - sec.from) / bar);
      t = sec.to;
    }
    expect(t).toBe(CONTACT_DURATION);
    for (const g of GOLPES) for (const w of g.words) expect(w.at % beat, `${g.scene}/${w.id}`).toBe(0);
    for (const h of HEADS) expect(HEAD_TIMES[h][0] % beat, h).toBeLessThanOrEqual(0.12);
  });

  it('is music, not effects: a melody wherever the picture tells, a hit on every word slam, silence at the end', () => {
    const notes = arrange(PARTITURA);
    // Every section with images (not the open, not the builds) sings: the lead or the piano carries a line.
    for (const sec of PARTITURA.sections.filter((x) => !['gancho', 'subida'].includes(x.style))) {
      const sung = notes.filter((n) => (n.inst === 'lead' || n.inst === 'keys') && n.t >= sec.from && n.t < sec.to && n.midi! >= 72);
      expect(sung.length, `${sec.style} at ${sec.from} has no melody`).toBeGreaterThan(3);
    }
    // Strings and bass hold the harmony under every second of the film but the last half second.
    for (let s = 0; s < CONTACT_DURATION - 1; s++) {
      expect(notes.some((n) => n.inst === 'strings' && n.t <= s + 0.01 && n.t + n.dur >= s + 0.5), `no strings at ${s} s`).toBe(true);
    }
    // Each word slam lands on a kick.
    for (const g of GOLPES) for (const w of g.words) expect(notes.some((n) => n.inst === 'kick' && Math.abs(n.t - w.at) < 1e-6), `${g.scene}/${w.id} at ${w.at} s`).toBe(true);
    // Nothing starts in the last half second; the held notes end before the last frame.
    expect(notes.filter((n) => n.t > CONTACT_DURATION - 0.5)).toEqual([]);
    for (const n of notes.filter((x) => ['strings', 'bass', 'lead'].includes(x.inst))) expect(n.t + n.dur, `${n.inst} at ${n.t}`).toBeLessThanOrEqual(CONTACT_DURATION - 0.3);
  });

  it('shows the price only at the close: from the catalog, in pesos with the dollar below and the rate\'s date', () => {
    // Ignacio, 27/10/2026: the close shows the plan's price in pesos, the dollar below. No other line carries an amount.
    for (const locale of ['es', 'en', 'pt']) {
      const video = load(locale).video as Tree;
      const { price, ...rest } = video;
      const words = strings(rest as Tree);
      expect(words.filter((w) => /\b(USD|ARS|BRL|US\$|R\$|\$)\s?\d|\/mes|\/month|\/mês/i.test(w)), locale).toEqual([]);
      expect(words.filter((w) => /\b(IA|AI)\b|inteligencia artificial|artificial intelligence/i.test(w)), locale).toEqual([]);
      // The price templates take every number from code (catalog × dated rate): none is typed in the copy.
      for (const line of strings(price as Tree)) expect(line.replace(/\{\w+\}/g, ''), `${locale}: ${line}`).not.toMatch(/\d/);
    }
    const usd = planInfo('contact').priceUsdMonthly;
    const ars = localAmount(usd, 'ARS')!;
    expect(ars % 1000).toBe(0);
    expect(Math.abs(ars - usd * rates.ARS)).toBeLessThanOrEqual(500);
    const t = (k: string, v: Record<string, string>) => (at(load('es'), `video.price.${k}`) ?? '').replace(/\{(\w+)\}/g, (_, x: string) => v[x]);
    const lines = priceLines(t, 'es', usd);
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(`$ ${new Intl.NumberFormat('es-AR').format(ars)}/mes`);
    expect(lines[1]).toBe(`USD ${usd}/mes`);
    expect(lines[2]).toContain(RATE_DATE.split('-').reverse().join('/'));
  });

  it('every frame says it is a demo with fictional data', () => {
    expect(at(load('es'), 'video.seal')).toBe('Demo · datos ficticios');
    for (const locale of ['en', 'pt']) expect(at(load(locale), 'video.seal')).toMatch(/^Demo · /);
  });
});
