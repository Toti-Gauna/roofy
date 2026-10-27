import '../globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, localeTags, type Locale } from '@/i18n/routing';
import { fontMono, fontSans, fontSerif } from '../fonts';
import { absoluteUrl } from '@/lib/env';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#05050A',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
    // Test publication (lote 1.6): not indexed until the real experience is approved (lote 3.9).
    robots: { index: false, follow: false },
    alternates: {
      canonical: absoluteUrl(`/${locale}/`),
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [localeTags[l], absoluteUrl(`/${l}/`)])),
        'x-default': absoluteUrl('/'),
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={localeTags[locale as Locale]} className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}>
      <body className="bg-void">{children}</body>
    </html>
  );
}
