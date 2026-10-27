'use client';

import { buildEclipseUrl, cleanSearch, parseHandoff, type Locale } from '@/lib/handoff';
import { BASE_PATH, ECLIPSE_URL } from '@/lib/env';
import { useSearch } from '@/lib/useSearch';

export interface SiteNavText {
  languageLabel: string;
  back: string;
  languages: Record<Locale, string>;
}

const LOCALE_TAGS: Record<Locale, string> = { es: 'es-AR', en: 'en', pt: 'pt-BR' };

/** Language links (they keep what the link from Eclipse carried) and the way back to Eclipse. */
export function SiteNav({ locale, locales, text }: { locale: Locale; locales: readonly Locale[]; text: SiteNavText }) {
  const search = useSearch();
  const state = parseHandoff(locale, search);
  const back = buildEclipseUrl({ locale, currency: state.currencyExplicit ? state.currency : undefined }, ECLIPSE_URL);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <a href={back} className="btn-ghost">
        {text.back}
      </a>
      <nav aria-label={text.languageLabel}>
        <ul className="flex gap-1">
          {locales.map((l) => (
            <li key={l}>
              <a
                href={`${BASE_PATH}/${l}/${cleanSearch(l, search)}`}
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
