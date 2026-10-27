import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  AREAS,
  CURRENCIES,
  DEFAULT_CURRENCY,
  ECLIPSE_SECTIONS,
  LOCALES,
  UTM_KEYS,
  VISTAS,
  buildEclipseUrl,
  buildEstateosUrl,
  cleanSearch,
  parseHandoff,
  type HandoffInput,
  type Locale,
} from '@/lib/handoff';

interface Fixture {
  digest: string;
  cases: {
    toEstateos: { name: string; input: unknown; url: string }[];
    parseEstateos: { name: string; locale: Locale; search: string; expected: ReturnType<typeof parseHandoff>; cleanSearch: string }[];
    toEclipse: { name: string; input: unknown; url: string }[];
    fromEstateos: { name: string; search: string; currency: string | null }[];
  };
}

const fixture = JSON.parse(readFileSync(new URL('./fixtures/handoff-cases.json', import.meta.url), 'utf8')) as Fixture;

describe('handoff contract fixture', () => {
  // The same file lives in Eclipse-Web (tests/fixtures/handoff-cases.json). If this digest and
  // the one over there differ, the two sites no longer agree on the link.
  it('carries its own digest', () => {
    const digest = createHash('sha256').update(JSON.stringify(fixture.cases)).digest('hex');
    expect(fixture.digest).toBe(digest);
  });
});

describe('Eclipse → EstateOS', () => {
  it.each(fixture.cases.toEstateos)('$name', ({ input, url }) => {
    expect(buildEstateosUrl(input as HandoffInput)).toBe(url);
  });

  it('uses the origin it is given (previews)', () => {
    expect(buildEstateosUrl({ locale: 'en', currency: 'USD' }, 'http://localhost:3000')).toBe('http://localhost:3000/en/?moneda=USD');
  });

  it('drops a utm value longer than 100 characters', () => {
    expect(buildEstateosUrl({ locale: 'es', utm: { utm_source: 'a'.repeat(101) } })).toBe('https://roofy.eclipse-business.com/es/');
    expect(buildEstateosUrl({ locale: 'es', utm: { utm_source: 'a'.repeat(100) } })).toContain(`utm_source=${'a'.repeat(100)}`);
  });
});

describe('reading what Eclipse sent', () => {
  it.each(fixture.cases.parseEstateos)('$name', ({ locale, search, expected, cleanSearch: cleaned }) => {
    expect(parseHandoff(locale, search)).toEqual(expected);
    expect(cleanSearch(locale, search)).toBe(cleaned);
  });

  it('never returns a raw value: only allow-listed constants', () => {
    const state = parseHandoff('es', '?moneda=<b>&vista=<i>&area=<u>&utm_source=<s>');
    expect(JSON.stringify(state)).not.toMatch(/[<>]/);
    expect(CURRENCIES).toContain(state.currency);
    expect(VISTAS).toContain(state.vista);
  });

  it('a cleaned search reads back as clean and as the same state', () => {
    for (const { locale, search } of fixture.cases.parseEstateos) {
      const cleaned = cleanSearch(locale, search);
      const again = parseHandoff(locale, cleaned);
      expect(again.clean).toBe(true);
      const first = parseHandoff(locale, search);
      expect({ ...again, clean: true }).toEqual({ ...first, clean: true });
    }
  });
});

describe('EstateOS → Eclipse', () => {
  it.each(fixture.cases.toEclipse)('$name', ({ input, url }) => {
    expect(buildEclipseUrl(input as Parameters<typeof buildEclipseUrl>[0])).toBe(url);
  });

  it('what EstateOS sends back is something Eclipse reads (currency round trip)', () => {
    for (const currency of CURRENCIES) {
      const back = buildEclipseUrl({ locale: 'es', currency });
      expect(new URL(back).searchParams.get('moneda')).toBe(currency);
    }
  });
});

describe('allow-lists', () => {
  it('match the contract document', () => {
    expect(LOCALES).toEqual(['es', 'en', 'pt']);
    expect(CURRENCIES).toEqual(['ARS', 'BRL', 'USD']);
    expect(VISTAS).toEqual(['entrada', 'guia', 'branding', 'intelligence', 'academy']);
    expect(AREAS).toEqual(['recepcion', 'administracion', 'ventas', 'marketing']);
    expect(ECLIPSE_SECTIONS).toEqual(['inicio', 'servicios', 'pyme', 'ejemplos', 'precios', 'problema', 'proceso', 'contacto']);
    expect(UTM_KEYS).toEqual(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']);
    expect(DEFAULT_CURRENCY).toEqual({ es: 'ARS', pt: 'BRL', en: 'USD' });
  });
});
