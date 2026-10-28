import { cleanSearch, type Locale } from '@/lib/handoff';

/**
 * Where a visit lands (lote B1): the site's home is `/<locale>/` and the Lumen demo lives at
 * `/<locale>/demo/`. The link contract (docs/contrato-enlace.md) still builds `/<locale>/?…`: a link
 * that asks for the demo — any of `plan`, `vista` or `area` in its query, valid or not — is sent on
 * to `/demo/` with the query and the hash untouched, and the demo filters the values as it always did.
 * `moneda` and `utm_*` alone stay on the home. Pure functions, no DOM.
 */
export const DEMO_KEYS = ['plan', 'vista', 'area'] as const;

/** Does this query ask for the demo? (Presence is enough: the demo cleans values off its lists.) */
export function wantsDemo(search: string): boolean {
  const p = new URLSearchParams(search);
  return DEMO_KEYS.some((key) => p.has(key));
}

/** The home's query: what the contract carries (cleaned), minus what would send the visit to the demo. */
export function siteSearch(locale: Locale, search: string): string {
  const p = new URLSearchParams(cleanSearch(locale, search));
  DEMO_KEYS.forEach((key) => p.delete(key));
  const query = p.toString();
  return query ? `?${query}` : '';
}

/** The demo's query, keeping `moneda` and `utm_*`; `plan` opens that plan's demo (none = the general demo). */
export function demoSearch(locale: Locale, search: string, plan?: string | null): string {
  const p = new URLSearchParams(siteSearch(locale, search));
  if (plan) p.set('plan', plan);
  // Rebuild through the contract so the order stays fixed and the plan is checked against its list.
  return cleanSearch(locale, p.toString());
}

/**
 * Inline script, first thing in the home's <main>: a link that asks for the demo leaves at once
 * (`replace`, so Back does not bounce) before anything paints. The keys are the constant above, never
 * what was received; the target is built from the build's base path and the page's locale.
 */
export function demoRedirectScript(basePath: string, locale: Locale): string {
  const target = JSON.stringify(`${basePath}/${locale}/demo/`);
  const keys = JSON.stringify(DEMO_KEYS);
  return `(function(){try{var p=new URLSearchParams(location.search),k=${keys};for(var i=0;i<k.length;i++){if(p.has(k[i])){document.documentElement.style.visibility='hidden';location.replace(${target}+location.search+location.hash);return;}}}catch(e){document.documentElement.style.visibility='';}})();`;
}
