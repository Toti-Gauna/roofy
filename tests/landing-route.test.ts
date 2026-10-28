import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { DEMO_KEYS, demoRedirectScript, demoSearch, siteSearch, wantsDemo } from '@/lib/landing-route';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/handoff-cases.json', import.meta.url), 'utf8')) as {
  cases: { toEstateos: { name: string; url: string }[] };
};

/** Runs the inline script against a fake address; returns where it went (null = it stayed). */
function run(basePath: string, locale: 'es' | 'en' | 'pt', search: string, hash = ''): { to: string | null; hidden: boolean } {
  let to: string | null = null;
  const style = { visibility: '' };
  runInNewContext(demoRedirectScript(basePath, locale), {
    URLSearchParams,
    location: { search, hash, replace: (url: string) => (to = url) },
    document: { documentElement: { style } },
  });
  return { to, hidden: style.visibility === 'hidden' };
}

describe('landing route (lote B1)', () => {
  it('sends a link that asks for the demo to /demo/, query and hash untouched', () => {
    expect(run('', 'es', '?plan=growth&moneda=USD', '#x')).toEqual({ to: '/es/demo/?plan=growth&moneda=USD#x', hidden: true });
    expect(run('/roofy', 'pt', '?vista=guia&area=ventas')).toEqual({ to: '/roofy/pt/demo/?vista=guia&area=ventas', hidden: true });
    // Invalid values still go: the demo cleans them, as it always did.
    expect(run('', 'en', '?plan=nope').to).toBe('/en/demo/?plan=nope');
  });

  it('keeps moneda, utm_* and foreign parameters on the home', () => {
    expect(run('', 'es', '?moneda=ARS&utm_source=eclipse&fbclid=1')).toEqual({ to: null, hidden: false });
    expect(run('', 'es', '')).toEqual({ to: null, hidden: false });
  });

  it('agrees with every link Eclipse builds (shared fixture)', () => {
    for (const c of fixture.cases.toEstateos) {
      const url = new URL(c.url);
      const asksForDemo = DEMO_KEYS.some((key) => url.searchParams.has(key));
      expect(wantsDemo(url.search), c.name).toBe(asksForDemo);
      const locale = url.pathname.split('/')[1] as 'es' | 'en' | 'pt';
      expect(run('', locale, url.search).to, c.name).toBe(asksForDemo ? `/${locale}/demo/${url.search}` : null);
    }
  });

  it('builds the home query without anything that would bounce back to the demo', () => {
    expect(siteSearch('es', '?plan=growth&vista=guia&area=ventas&moneda=USD&utm_source=x')).toBe('?moneda=USD&utm_source=x');
    expect(wantsDemo(siteSearch('es', '?plan=contact&vista=entrada'))).toBe(false);
    expect(siteSearch('es', '')).toBe('');
  });

  it('builds the demo query in the contract order, with a checked plan', () => {
    expect(demoSearch('es', '?utm_source=x&moneda=BRL', 'escalar')).toBe('?moneda=BRL&plan=escalar&utm_source=x');
    expect(demoSearch('es', '?plan=growth', null)).toBe('');
    expect(demoSearch('en', '', 'not-a-plan')).toBe('');
  });
});
