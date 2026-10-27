import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { Experience } from '@/components/experience/Experience';
import { SiteNav } from '@/components/SiteNav';
import { SoundProvider } from '@/components/sound/SoundProvider';

/** Namespaces the stage (Lumen, the guide, sound, the plan lens) reads on the client. */
const CLIENT_NAMESPACES = ['demoKit', 'demoRealEstate', 'demoTours', 'demoShowcase', 'sound', 'tour', 'common', 'experience'] as const;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
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
              text={{
                languageLabel: tl('label'),
                back: t('back'),
                languages: { es: tl('es'), en: tl('en'), pt: tl('pt') },
              }}
            />
          }
        />
      </SoundProvider>
    </NextIntlClientProvider>
  );
}
