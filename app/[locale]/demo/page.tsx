import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, localeTags, type Locale } from '@/i18n/routing';
import { Experience } from '@/components/experience/Experience';
import { SiteNav } from '@/components/SiteNav';
import { SoundProvider } from '@/components/sound/SoundProvider';
import { absoluteUrl } from '@/lib/env';

/** Namespaces the stage (Lumen, the guide, sound, the plan lens) reads on the client. */
const CLIENT_NAMESPACES = ['demoKit', 'demoRealEstate', 'demoTours', 'demoShowcase', 'sound', 'tour', 'common', 'experience'] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'demoMeta' });
  return {
    title: t('title'),
    description: t('description'),
    // Test publication: not indexed until the commercial launch (lote 3.9).
    robots: { index: false, follow: false },
    alternates: {
      canonical: absoluteUrl(`/${locale}/demo/`),
      languages: Object.fromEntries(routing.locales.map((l) => [localeTags[l], absoluteUrl(`/${l}/demo/`)])),
    },
  };
}

/**
 * The Lumen demo, full screen (lote 3.5, D35). It was the home until lote B1; links that still ask the
 * home for it (`?plan=`, `?vista=`, `?area=`) are sent here before paint (lib/landing-route.ts).
 */
export default async function DemoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations({ locale, namespace: 'home' });
  const tl = await getTranslations({ locale, namespace: 'languages' });
  const all = (await getMessages({ locale })) as Record<string, unknown>;
  const messages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, all[ns]]));

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SoundProvider>
        <Experience
          locale={l}
          nav={
            <SiteNav
              locale={l}
              locales={routing.locales}
              page="demo"
              text={{
                languageLabel: tl('label'),
                lead: t('toSite'),
                languages: { es: tl('es'), en: tl('en'), pt: tl('pt') },
              }}
            />
          }
        />
      </SoundProvider>
    </NextIntlClientProvider>
  );
}
