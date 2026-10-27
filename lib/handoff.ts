/**
 * Link contract between Eclipse (eclipse-business.com) and EstateOS (this site), lote 1.6.
 * Spec and fixture: docs/contrato-enlace.md and tests/fixtures/handoff-cases.json. The same
 * fixture, byte for byte, lives in Eclipse-Web (tests/fixtures/handoff-cases.json): both repos
 * test it, so a change here that is not copied there fails a test on one side.
 *
 * Language travels in the PATH (`/es/`, `/en/`, `/pt/`) and currency in the QUERY (`moneda`),
 * because the two sites are different origins and share no storage. Pure functions, no DOM.
 *
 * Every value is compared against a constant allow-list and the CONSTANT is used afterwards:
 * nothing received is ever echoed, interpolated into HTML or built into an `href`. This side is
 * tolerant: an invalid value is dropped (and reported through `clean: false`) instead of
 * breaking the page, because a link from outside must never land on an error.
 */

export const LOCALES = ['es', 'en', 'pt'] as const;
export const CURRENCIES = ['ARS', 'BRL', 'USD'] as const;
export const VISTAS = ['entrada', 'guia', 'branding', 'intelligence', 'academy'] as const;
export const AREAS = ['recepcion', 'administracion', 'ventas', 'marketing'] as const;
/** Ids of the sections of the Eclipse home (Eclipse-Web `SECTION_IDS`). */
export const ECLIPSE_SECTIONS = ['inicio', 'servicios', 'pyme', 'ejemplos', 'precios', 'problema', 'proceso', 'contacto'] as const;
export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export type Locale = (typeof LOCALES)[number];
export type Currency = (typeof CURRENCIES)[number];
export type Vista = (typeof VISTAS)[number];
export type Area = (typeof AREAS)[number];
export type EclipseSection = (typeof ECLIPSE_SECTIONS)[number];
export type UtmKey = (typeof UTM_KEYS)[number];

export const ESTATEOS_ORIGIN = 'https://roofy.eclipse-business.com';
export const ECLIPSE_ORIGIN = 'https://eclipse-business.com';

/** Same defaults as Eclipse-Web `defaultCurrencyFor`. */
export const DEFAULT_CURRENCY: Record<Locale, Currency> = { es: 'ARS', pt: 'BRL', en: 'USD' };

const UTM_VALUE = /^[A-Za-z0-9_.-]{1,100}$/;

const pick = <T extends string>(list: readonly T[], value: string | null): T | null => list.find((item) => item === value) ?? null;

export const isLocale = (value: unknown): value is Locale => typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

export interface HandoffInput {
  locale: Locale;
  currency?: Currency;
  vista?: Vista;
  /** Only valid inside the guide (`vista: 'guia'`); anywhere else it is left out. */
  area?: Area;
  utm?: Partial<Record<UtmKey, string>>;
}

export interface HandoffState {
  currency: Currency;
  /** `true` when `currency` came from a valid `moneda`, `false` when it is the locale's default. */
  currencyExplicit: boolean;
  vista: Vista;
  area: Area | null;
  utm: Partial<Record<UtmKey, string>>;
  /** `true` when every owned parameter received was valid (or there was none). */
  clean: boolean;
}

/** The owned parameters in their fixed order: moneda, vista, area, utm_*. */
function ownedParams(input: Pick<HandoffInput, 'currency' | 'vista' | 'area' | 'utm'>): [string, string][] {
  const out: [string, string][] = [];
  const currency = pick(CURRENCIES, input.currency ?? null);
  if (currency) out.push(['moneda', currency]);
  const vista = pick(VISTAS, input.vista ?? null);
  if (vista) out.push(['vista', vista]);
  const area = vista === 'guia' ? pick(AREAS, input.area ?? null) : null;
  if (area) out.push(['area', area]);
  for (const key of UTM_KEYS) {
    const value = input.utm?.[key];
    if (value !== undefined && UTM_VALUE.test(value)) out.push([key, value]);
  }
  return out;
}

const OWNED_KEYS: readonly string[] = ['moneda', 'vista', 'area', ...UTM_KEYS];

function toQuery(input: Pick<HandoffInput, 'currency' | 'vista' | 'area' | 'utm'>): string {
  const query = new URLSearchParams(ownedParams(input)).toString();
  return query ? `?${query}` : '';
}

/** Eclipse → EstateOS. Mirror of Eclipse-Web `estateosUrl`. */
export function buildEstateosUrl(input: HandoffInput, origin: string = ESTATEOS_ORIGIN): string {
  return `${origin}/${input.locale}/${toQuery(input)}`;
}

/** EstateOS → Eclipse: back to the Eclipse home in the same language and currency. */
export function buildEclipseUrl(input: { locale: Locale; currency?: Currency; section?: EclipseSection }, origin: string = ECLIPSE_ORIGIN): string {
  const section = pick(ECLIPSE_SECTIONS, input.section ?? null);
  return `${origin}/${input.locale}/${toQuery({ currency: input.currency })}${section ? `#${section}` : ''}`;
}

/**
 * Reads what Eclipse sent. `search` is `location.search`, with or without `?`; when a parameter
 * repeats, the first value wins. Without a valid `moneda` the currency is the locale's default.
 */
export function parseHandoff(locale: Locale, search: string): HandoffState {
  const p = new URLSearchParams(search);
  let clean = true;

  const rawCurrency = p.get('moneda');
  const currency = pick(CURRENCIES, rawCurrency);
  if (rawCurrency !== null && !currency) clean = false;

  const rawVista = p.get('vista');
  const vista = pick(VISTAS, rawVista);
  if (rawVista !== null && !vista) clean = false;

  const rawArea = p.get('area');
  let area = pick(AREAS, rawArea);
  // An area only exists inside the guide.
  if (rawArea !== null && (!area || vista !== 'guia')) {
    area = null;
    clean = false;
  }

  const utm: Partial<Record<UtmKey, string>> = {};
  for (const key of UTM_KEYS) {
    const value = p.get(key);
    if (value === null) continue;
    if (UTM_VALUE.test(value)) utm[key] = value;
    else clean = false;
  }

  return {
    currency: currency ?? DEFAULT_CURRENCY[locale],
    currencyExplicit: currency !== null,
    vista: vista ?? 'entrada',
    area,
    utm,
    clean,
  };
}

/**
 * The same `search` rewritten with only valid owned parameters, for `history.replaceState`.
 * Foreign parameters (fbclid, gclid, …) are kept untouched and go first, as in Eclipse-Web.
 */
export function cleanSearch(locale: Locale, search: string): string {
  const state = parseHandoff(locale, search);
  const p = new URLSearchParams(search);
  OWNED_KEYS.forEach((key) => p.delete(key));
  for (const [key, value] of ownedParams({
    currency: state.currencyExplicit ? state.currency : undefined,
    vista: pick(VISTAS, new URLSearchParams(search).get('vista')) ?? undefined,
    area: state.area ?? undefined,
    utm: state.utm,
  })) {
    p.append(key, value);
  }
  const query = p.toString();
  return query ? `?${query}` : '';
}
