import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SoundProvider } from '@/components/sound/SoundProvider';
import { RenderPage } from '@/components/video/RenderPage';

/**
 * The video factory's render page (lote V1, guía de motion v1 §7): dev only (`page.dev.tsx` is not a page
 * extension in `next build`), so it never reaches the export. `?piece=contact&ratio=16x9`; the driver is
 * `scripts/render-video.mjs`.
 */
const NAMESPACES = ['demoKit', 'demoRealEstate', 'demoTours', 'demoShowcase', 'sound', 'tour', 'common', 'experience', 'video'] as const;

export default async function Render({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const all = (await getMessages({ locale })) as Record<string, unknown>;
  const messages = Object.fromEntries(NAMESPACES.map((ns) => [ns, all[ns]]));
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SoundProvider>
        <RenderPage />
      </SoundProvider>
    </NextIntlClientProvider>
  );
}
