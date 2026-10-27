import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { HandoffPanel } from '@/components/HandoffPanel';
import { SiteNav } from '@/components/SiteNav';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations({ locale, namespace: 'home' });
  const tl = await getTranslations({ locale, namespace: 'languages' });
  const tk = await getTranslations({ locale, namespace: 'link' });

  return (
    <div className="corona-glow min-h-dvh">
      <div className="container-x flex min-h-dvh flex-col gap-16 py-6 md:py-10">
        <SiteNav
          locale={l}
          locales={routing.locales}
          text={{
            languageLabel: tl('label'),
            back: t('back'),
            languages: { es: tl('es'), en: tl('en'), pt: tl('pt') },
          }}
        />
        <main id="contenido" className="flex flex-1 flex-col justify-center gap-10">
          <div>
            <p className="label">{t('status')}</p>
            <h1 className="display mt-4 text-[clamp(3.5rem,14vw,9rem)]">{t('name')}</h1>
            <p className="mt-6 max-w-[48ch] text-lg text-fg-muted">{t('lead')}</p>
          </div>
          <HandoffPanel
            locale={l}
            text={{
              title: tk('title'),
              intro: tk('intro'),
              language: tk('language'),
              currency: tk('currency'),
              view: tk('view'),
              area: tk('area'),
              none: tk('none'),
              languageName: tl(l),
              currencies: { ARS: tk('currencies.ARS'), BRL: tk('currencies.BRL'), USD: tk('currencies.USD') },
              views: {
                entrada: tk('views.entrada'),
                guia: tk('views.guia'),
                branding: tk('views.branding'),
                intelligence: tk('views.intelligence'),
                academy: tk('views.academy'),
              },
              areas: {
                recepcion: tk('areas.recepcion'),
                administracion: tk('areas.administracion'),
                ventas: tk('areas.ventas'),
                marketing: tk('areas.marketing'),
              },
            }}
          />
        </main>
      </div>
    </div>
  );
}
