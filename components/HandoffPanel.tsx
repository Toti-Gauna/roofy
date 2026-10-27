'use client';

import { useEffect } from 'react';
import { cleanSearch, parseHandoff, type Area, type Currency, type Locale, type Vista } from '@/lib/handoff';
import { useSearch } from '@/lib/useSearch';

export interface HandoffPanelText {
  title: string;
  intro: string;
  language: string;
  currency: string;
  view: string;
  area: string;
  none: string;
  languageName: string;
  currencies: Record<Currency, string>;
  views: Record<Vista, string>;
  areas: Record<Area, string>;
}

/**
 * Lote 1.6 test panel: shows what the link from Eclipse carried (language by path, currency
 * and view by query). Only allow-listed constants are rendered, never the raw query. It is
 * removed when the real experience arrives (lote 3.5).
 */
export function HandoffPanel({ locale, text }: { locale: Locale; text: HandoffPanelText }) {
  const search = useSearch();
  const state = parseHandoff(locale, search);

  // A link from outside never errors: whatever this site does not understand is dropped.
  useEffect(() => {
    if (!search || state.clean) return;
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${cleanSearch(locale, search)}${window.location.hash}`);
  }, [search, state.clean, locale]);

  const rows: [string, string][] = [
    [text.language, text.languageName],
    [text.currency, text.currencies[state.currency]],
    [text.view, text.views[state.vista]],
    [text.area, state.area ? text.areas[state.area] : text.none],
  ];

  return (
    <section aria-labelledby="link-title" className="border-t border-line pt-8">
      <h2 id="link-title" className="label">
        {text.title}
      </h2>
      <p className="mt-3 max-w-[56ch] text-fg-muted">{text.intro}</p>
      <dl className="mt-6 grid max-w-xl grid-cols-[auto_1fr] gap-x-8 gap-y-3" aria-live="polite">
        {rows.map(([term, value]) => (
          <div key={term} className="contents">
            <dt className="label self-center">{term}</dt>
            <dd className="readout text-fg">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
