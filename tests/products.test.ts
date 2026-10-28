import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import plans from '@/content/estateos-plans.json';
import { launchDate, otherProducts, products } from '@/lib/products';
import { whatsappUrl } from '@/lib/whatsapp';
import { WHATSAPP_NUMBER } from '@/lib/env';

type Tree = { [k: string]: string | Tree };
const LOCALES = ['es', 'en', 'pt'] as const;
const messages = Object.fromEntries(LOCALES.map((l) => [l, JSON.parse(readFileSync(new URL(`../messages/${l}.json`, import.meta.url), 'utf8')) as Tree]));
const get = (tree: Tree, key: string) => key.split('.').reduce<string | Tree | undefined>((node, k) => (node && typeof node === 'object' ? node[k] : undefined), tree);
const strings = (tree: Tree): string[] => Object.values(tree).flatMap((v) => (typeof v === 'string' ? [v] : strings(v)));

describe('products (content/products.json, a copy of Eclipse-Web)', () => {
  // The same file lives in Eclipse-Web (content/products.json, 76767ea). If it changes there, copy it here, update this digest
  // and the copy in messages (`site.others`, taken from Eclipse-Web's `products.items`).
  it('is the copy of Eclipse-Web pinned by its digest', () => {
    const bytes = readFileSync(new URL('../content/products.json', import.meta.url));
    expect(createHash('sha256').update(bytes).digest('hex')).toBe('8d2d6596a3924d7374f1f7dfa76e9c80565a968a9c125b237d302b9de66a06a3');
  });

  it('lists Roofy first, then the four products of the home and the four coming ones', () => {
    expect(products.map((p) => p.id)).toEqual(['roofy', 'foody', 'markyt', 'handy', 'gym', 'dental', 'clinic', 'vet']);
    expect(otherProducts.map((p) => p.id)).toEqual(['foody', 'markyt', 'handy', 'gym', 'dental', 'clinic', 'vet']);
  });

  it('is honest about status: only Roofy is on sale, and only it has a level to take a price from', () => {
    expect(products.filter((p) => p.status === 'available').map((p) => p.id)).toEqual(['roofy']);
    expect(products.filter((p) => p.status === 'planned').map((p) => p.id)).toEqual(['foody', 'markyt']);
    expect(products.filter((p) => p.status === 'launch').map((p) => p.id)).toEqual(['handy']);
    expect(products.filter((p) => p.status === 'soon').map((p) => p.id)).toEqual(['gym', 'dental', 'clinic', 'vet']);
    for (const p of otherProducts) expect(p.fromLevel, p.id).toBeNull();
    // Roofy's entry level is the first rung of the plan ladder (its price is read from the catalog, lote B4).
    const roofy = products[0];
    expect(plans.plans.map((p) => p.id)).toContain(roofy.fromLevel);
    expect(roofy.fromLevel).toBe(plans.plans[0].id);
  });

  it('a launching product has a real date, written out per locale', () => {
    const handy = products.find((p) => p.id === 'handy')!;
    expect(launchDate(handy, 'es')).toBe('10 de noviembre de 2026');
    expect(launchDate(handy, 'en')).toBe('November 10, 2026');
    expect(launchDate(handy, 'pt')).toBe('10 de novembro de 2026');
    expect(launchDate(products[0], 'es')).toBeNull();
  });

  it.each(LOCALES)('every other product has its copy in %s (name, rubro, line, four points and its WhatsApp message)', (locale) => {
    for (const p of otherProducts) {
      const base = `site.others.items.${p.id}`;
      for (const key of ['name', 'rubro', 'line', 'ask']) expect(typeof get(messages[locale], `${base}.${key}`), `${locale} ${p.id}.${key}`).toBe('string');
      expect(p.points.length, p.id).toBe(4);
      for (const point of p.points) expect(typeof get(messages[locale], `${base}.points.${point}`), `${locale} ${p.id}.points.${point}`).toBe('string');
    }
  });

  it.each(LOCALES)('«otros negocios» in %s never states a price, in any currency', (locale) => {
    const others = get(messages[locale], 'site.others') as Tree;
    const price = /USD|ARS|BRL|US\$|R\$|\$\s?\d|\d\s?(\/\s?mes|\/\s?month|\/\s?mês)|dólar|dollar|pesos?|reais/i;
    for (const text of strings(others)) expect(text, text).not.toMatch(price);
  });
});

describe('whatsapp', () => {
  it("points to Eclipse's number and encodes the prefilled message", () => {
    expect(WHATSAPP_NUMBER).toBe('5492234467881');
    expect(whatsappUrl()).toBe('https://wa.me/5492234467881');
    expect(whatsappUrl('Hola Eclipse. ¿Me avisan?')).toBe(`https://wa.me/5492234467881?text=${encodeURIComponent('Hola Eclipse. ¿Me avisan?')}`);
  });
});
