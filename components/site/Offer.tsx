import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { DemoLink } from '@/components/SiteNav';
import { PhaseGlyph } from '@/components/ui/PhaseGlyph';
import { Plate } from '@/components/sections/products/Plate';
import { sectionNumber, sectionPhase } from '@/lib/sections';
import './offer.css';

/** What Roofy gives an agency, in the order of Eclipse-Web's `content/products.json` (roofy.features, 76767ea). */
export const OFFER_FEATURES = ['web', 'crm', 'visits', 'chat', 'team', 'brand'] as const;
export type OfferFeature = (typeof OFFER_FEATURES)[number];

export interface OfferText {
  section: string;
  title: ReactNode;
  lead: string;
  features: Record<OfferFeature, { name: string; text: string }>;
  start: string;
  demo: string;
}

/**
 * 02 · Qué ofrecemos (lote B2, ahead of B3 so the automatic tour has somewhere to go). What the product gives an agency:
 * Roofy's plate (drawn, then alive) and its six deliveries as a numbered ledger — hairlines, mono indices, one serif
 * name each — never a grid of identical cards. The copy is Eclipse-Web's approved copy for Roofy (products.items.roofy).
 * No solid amber here (the hero's is the page's one): «Probar la demo» is the quiet button.
 *
 * Tour stops (`data-tour-stop`): the section's head, and the ledger's first and fourth rows (the automatic tour skips
 * the ones already on screen, so on a wide screen it holds once and on a phone it walks the list).
 */
export function Offer({ locale, id, text }: { locale: Locale; id: 'ofrecemos'; text: OfferText }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} tabIndex={-1} className="offer theme-dark relative isolate bg-night">
      <div aria-hidden className="offer-light" />
      <div className="offer-grid container-x">
        <div className="offer-head" data-tour-stop>
          <p className="label offer-index">
            <PhaseGlyph phase={sectionPhase(id)} size={16} />
            <span className="readout">{sectionNumber(id)}</span>
            <span>{text.section}</span>
          </p>
          <h2 id={`${id}-title`} className="display offer-title">
            {text.title}
          </h2>
          <p className="offer-lead">{text.lead}</p>
          <Plate id="roofy" className="offer-plate" />
        </div>

        <div className="offer-body">
          <ol className="offer-list">
            {OFFER_FEATURES.map((f, i) => (
              <li key={f} className="offer-item" data-tour-stop={i === 0 || i === 3 ? '' : undefined}>
                <span aria-hidden className="readout offer-item-index">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="offer-item-name">{text.features[f].name}</h3>
                  <p className="offer-item-text">{text.features[f].text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="offer-foot">
            <p className="offer-start">{text.start}</p>
            <DemoLink locale={locale} className="btn btn-ghost offer-demo">
              {text.demo}
              <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.5} />
            </DemoLink>
          </div>
        </div>
      </div>
    </section>
  );
}
