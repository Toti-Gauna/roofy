import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { routing, type Locale } from '@/i18n/routing';
import { BackToEclipse, DemoLink, SiteNav } from '@/components/SiteNav';
import { PhaseGlyph } from '@/components/ui/PhaseGlyph';
import { BASE_PATH } from '@/lib/env';
import { demoRedirectScript } from '@/lib/landing-route';
import '@/components/site/site.css';

/**
 * «Eclipse para inmobiliarias», the site's home (lote B1). This is the base: the top row, section
 * 01 with the one primary action (the Lumen demo) and the footer. B2 brings the eclipse hero, B3 the
 * product and the other rubros, B4 the price levels, B5 the demos ledger (docs/plan-sitio-comercial.md).
 *
 * The inline script runs first: a link that still asks the home for the demo (`?plan=`, `?vista=`,
 * `?area=`, the link contract) goes on to `/demo/` before anything paints (lib/landing-route.ts).
 */
export default async function SitePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations({ locale, namespace: 'site' });
  const th = await getTranslations({ locale, namespace: 'home' });
  const tl = await getTranslations({ locale, namespace: 'languages' });
  const em = (chunks: React.ReactNode) => <em>{chunks}</em>;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: demoRedirectScript(BASE_PATH, l) }} />
      <a href="#contenido" className="sr-only-focusable site-skip">
        {t('skip')}
      </a>
      <div className="site theme-dark">
        <header className="site-top container-x">
          <SiteNav
            locale={l}
            locales={routing.locales}
            page="site"
            text={{ languageLabel: tl('label'), lead: t('name'), languages: { es: tl('es'), en: tl('en'), pt: tl('pt') } }}
          />
        </header>

        <main id="contenido" tabIndex={-1}>
          <section id="inicio" aria-labelledby="inicio-title" className="site-hero corona-glow grain">
            <div className="site-hero-inner container-x">
              <p className="label site-index">
                <PhaseGlyph phase={1} size={16} />
                <span className="readout">01</span>
                <span>{t('hero.section')}</span>
              </p>
              <h1 id="inicio-title" className="display site-title">
                {t.rich('hero.title', { em })}
              </h1>
              <p className="site-sub">{t('hero.sub')}</p>
              <div data-hero-cta className="site-cta">
                <DemoLink locale={l} className="btn btn-primary">
                  {t('hero.cta')}
                  <ArrowRight aria-hidden className="size-4" strokeWidth={1.5} />
                </DemoLink>
              </div>
              <p className="site-note">
                <span className="site-demo">{t('demoBadge')}</span>
                <span>{t('hero.demoNote')}</span>
              </p>
            </div>
          </section>
        </main>

        <footer aria-label={t('footer.label')} className="site-foot container-x">
          <BackToEclipse locale={l} className="btn btn-ghost btn-sm">
            {th('back')}
          </BackToEclipse>
          <p className="label">{t('footer.note')}</p>
        </footer>
      </div>
    </>
  );
}
