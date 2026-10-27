import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { FilmPage } from '@/components/video/FilmPage';

/**
 * The trailers' stage (lote V1, guía de motion §0): dev only (`page.dev.tsx` is not a page extension in `next build`),
 * so it never reaches the export. `?film=contact&ratio=16x9|9x16[&t=SECONDS]`; the driver is scripts/render-video.mjs.
 */
const NAMESPACES = ['demoKit', 'demoRealEstate', 'experience', 'video'] as const;

export default async function Trailer({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const all = (await getMessages({ locale })) as Record<string, unknown>;
  const messages = Object.fromEntries(NAMESPACES.map((ns) => [ns, all[ns]]));
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <FilmPage />
    </NextIntlClientProvider>
  );
}
