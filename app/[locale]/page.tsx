import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { BackToEclipse, SiteNav } from '@/components/SiteNav';
import { Hero } from '@/components/hero/Hero';
import { BASE_PATH } from '@/lib/env';
import { demoRedirectScript } from '@/lib/landing-route';
import '@/components/site/site.css';

/**
 * «Eclipse para inmobiliarias», the site's home. B1 laid the base (routes, links, the footer); B2 the
 * eclipse hero. Next: B3 the product and the other rubros, B4 the price levels, B5 the demos ledger
 * (docs/plan-sitio-comercial.md).
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
            text={{
              languageLabel: tl('label'),
              lead: (
                <span className="site-mark-lockup">
                  <span className="site-mark-brand">{t('brand')}</span>{' '}
                  <span className="site-mark-tagline">{t('tagline')}</span>
                </span>
              ),
              languages: { es: tl('es'), en: tl('en'), pt: tl('pt') },
            }}
          />
        </header>

        <main id="contenido" tabIndex={-1}>
          <Hero
            locale={l}
            id="inicio"
            text={{
              section: t('hero.section'),
              brand: t('brand'),
              tagline: t('tagline'),
              sub: t('hero.sub'),
              cta: t('hero.cta'),
              demoBadge: t('demoBadge'),
              demoNote: t('hero.demoNote'),
            }}
          />
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
