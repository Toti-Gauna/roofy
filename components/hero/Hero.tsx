import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { DemoLink } from '@/components/SiteNav';
import { PhaseGlyph } from '@/components/ui/PhaseGlyph';
import { HeroStage } from './HeroStage';
import './hero.css';

export interface HeroText {
  section: string;
  brand: string;
  tagline: string;
  sub: string;
  cta: string;
  demoBadge: string;
  demoNote: string;
}

/**
 * 01 · Inicio (lote B2). The composition of Eclipse-Web's hero (components/hero/Hero.tsx, 5cdb887): a
 * one-cell grid with the stage (eclipse, dial, stars) as a full-bleed layer behind the copy. Phones and
 * portrait tablets stack the eclipse above the copy; landscape from 768px and everything from 1024px put it
 * on the right, and the copy column never reaches the dial (hero.css).
 *
 * The H1 is the name, «Eclipse», with «para inmobiliarias» under it (decision of Ignacio, 28/10/2026). It is
 * server-rendered and visible from the first paint (the LCP element): no entrance ever hides it. One action,
 * «Ver la demo», the screen's only solid amber (`data-hero-cta`).
 *
 * [data-hero-pin-spacer] is the pinned scroll's spacer (useHeroMotion): ScrollTrigger never re-parents the section.
 */
export function Hero({ locale, id, text }: { locale: Locale; id: string; text: HeroText }) {
  return (
    <div data-hero-pin-spacer>
      <section id={id} aria-labelledby={`${id}-title`} data-hero className="hero theme-dark grain relative isolate grid min-h-[100svh] overflow-hidden bg-void">
        <HeroStage />
        <div className="relative z-10 [grid-area:1/1]">
          <div className="hero-copy-cell container-x">
            <div data-hero-copy-inner className="hero-copy-inner">
              <p className="label hero-index">
                <PhaseGlyph phase={1} size={16} />
                <span className="readout">01</span>
                <span>{text.section}</span>
              </p>
              <h1 id={`${id}-title`} className="hero-title display mt-4">
                <span className="hero-brand">{text.brand}</span>{' '}
                <em className="hero-tagline">{text.tagline}</em>
              </h1>
              <p className="hero-sub mt-5 text-base text-fg-muted sm:text-lg">{text.sub}</p>
              <div className="hero-ctas mt-7">
                <div data-hero-cta className="flex">
                  <DemoLink locale={locale} className="btn btn-primary w-full sm:w-auto">
                    {text.cta}
                    <ArrowRight aria-hidden className="size-4" strokeWidth={1.5} />
                  </DemoLink>
                </div>
              </div>
              <HeroNote badge={text.demoBadge}>{text.demoNote}</HeroNote>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroNote({ badge, children }: { badge: string; children: ReactNode }) {
  return (
    <p className="hero-note">
      <span className="site-demo">{badge}</span>
      <span>{children}</span>
    </p>
  );
}
