'use client';

import type { ReactNode } from 'react';
import { buildEclipseUrl, cleanSearch, parseHandoff, type Locale } from '@/lib/handoff';
import { demoSearch, siteSearch } from '@/lib/landing-route';
import { BASE_PATH, ECLIPSE_URL } from '@/lib/env';
import { useSearch } from '@/lib/useSearch';

export interface SiteNavText {
  languageLabel: string;
  /** The way out on the left: «Ir al sitio» on the demo, the site's name on the home. */
  lead: ReactNode;
  languages: Record<Locale, string>;
}

const LOCALE_TAGS: Record<Locale, string> = { es: 'es-AR', en: 'en', pt: 'pt-BR' };

/** The site's home in `locale`, with what the link from Eclipse carried (never what would bounce back to the demo). */
export const siteHref = (locale: Locale, search: string) => `${BASE_PATH}/${locale}/${siteSearch(locale, search)}`;

/**
 * The top row of both pages (lote B1). On the home: the site's name and the languages. On the demo
 * (`/demo/`): «Ir al sitio» and the languages. Language links keep what the link from Eclipse carried
 * (`cleanSearch`), and stay on the same page.
 */
export function SiteNav({ locale, locales, page, text }: { locale: Locale; locales: readonly Locale[]; page: 'site' | 'demo'; text: SiteNavText }) {
  const search = useSearch();
  const href = (l: Locale) => (page === 'demo' ? `${BASE_PATH}/${l}/demo/${cleanSearch(l, search)}` : siteHref(l, search));

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      {page === 'demo' ? (
        <a href={siteHref(locale, search)} className="btn btn-ghost btn-sm">
          {text.lead}
        </a>
      ) : (
        <a href={siteHref(locale, search)} aria-current="page" className="site-mark">
          {text.lead}
        </a>
      )}
      <nav aria-label={text.languageLabel}>
        <ul className="flex gap-1">
          {locales.map((l) => (
            <li key={l}>
              <a
                href={href(l)}
                hrefLang={LOCALE_TAGS[l]}
                lang={LOCALE_TAGS[l]}
                aria-current={l === locale ? 'page' : undefined}
                className={`readout inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm uppercase ${l === locale ? 'text-accent' : 'text-fg-muted'}`}
              >
                {l}
                <span className="sr-only">: {text.languages[l]}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/** «Volver a Eclipse»: back to the Eclipse home, with the currency only if the visit came with an explicit one. */
export function BackToEclipse({ locale, className, children }: { locale: Locale; className?: string; children: ReactNode }) {
  const search = useSearch();
  const state = parseHandoff(locale, search);
  return (
    <a href={buildEclipseUrl({ locale, currency: state.currencyExplicit ? state.currency : undefined }, ECLIPSE_URL)} className={className}>
      {children}
    </a>
  );
}

/**
 * A link to the Lumen demo (`/<locale>/demo/`): keeps `moneda` and `utm_*`, and `plan` opens that plan's
 * demo. Used by the hero now, and by the demo ledger and the price levels next (lotes B4–B5).
 */
export function DemoLink({ locale, plan, className, children, ...rest }: { locale: Locale; plan?: string | null; className?: string; children: ReactNode } & Record<`data-${string}`, string | boolean | undefined>) {
  const search = useSearch();
  return (
    <a href={`${BASE_PATH}/${locale}/demo/${demoSearch(locale, search, plan)}`} className={className} {...rest}>
      {children}
    </a>
  );
}
