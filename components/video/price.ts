import rates from '@/content/video-rates.json';

/**
 * The plan's price at the end of a video (decisión de Ignacio, 27/10/2026): the local currency first, the dollar
 * below, and the date of the rate used. The amount comes from the catalog (`planInfo`); the rate from
 * content/video-rates.json, fixed and dated, so the same source renders the same frames. Rounded like the site:
 * ARS to the nearest 1.000, BRL to the nearest 10.
 */
export type VideoCurrency = 'ARS' | 'BRL' | 'USD';
export const VIDEO_CURRENCY: Record<string, VideoCurrency> = { es: 'ARS', pt: 'BRL', en: 'USD' };
export const RATE_DATE: string = rates.date;

const STEP: Record<VideoCurrency, number> = { ARS: 1000, BRL: 10, USD: 1 };

/** The monthly price in `currency`, or null when there is no rate for it (the video then shows dollars only). */
export function localAmount(usd: number, currency: VideoCurrency): number | null {
  if (currency === 'USD') return null;
  const rate = (rates as Record<string, unknown>)[currency];
  if (typeof rate !== 'number') return null;
  return Math.round((usd * rate) / STEP[currency]) * STEP[currency];
}

const LOCALE_TAG: Record<string, string> = { es: 'es-AR', pt: 'pt-BR', en: 'en-US' };

/**
 * The closing's price lines in `locale`: [local amount, dollar amount, rate's date], or only the dollar line when
 * there is no rate for the local currency. `t` is the `video.price` translator (keys ars, brl, usd, rate).
 */
export function priceLines(t: (key: 'ars' | 'brl' | 'usd' | 'rate', values: Record<string, string>) => string, locale: string, usd: number): string[] {
  const tag = LOCALE_TAG[locale] ?? locale;
  const n = (v: number) => new Intl.NumberFormat(tag).format(v);
  const currency = VIDEO_CURRENCY[locale] ?? 'USD';
  const local = localAmount(usd, currency);
  if (local === null) return [t('usd', { amount: n(usd) })];
  const date = new Intl.DateTimeFormat(tag, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${RATE_DATE}T12:00:00Z`));
  return [t(currency === 'ARS' ? 'ars' : 'brl', { amount: n(local) }), t('usd', { amount: n(usd) }), t('rate', { date })];
}
