import productsJson from '@/content/products.json';
import { localeTags, type Locale } from '@/i18n/routing';

/**
 * Eclipse's products, from `content/products.json` (a copy of Eclipse-Web's, 76767ea; `tests/products.test.ts` pins its
 * digest). Each one says honestly where it stands: only what is on sale (`available`) has a price, and that price is
 * read from the plan catalog (lote B4), never written in the copy. Their copy lives in messages under
 * `site.others.items.<id>`, copied from Eclipse-Web's `products.items.<id>`.
 */
export const PRODUCT_IDS = ['roofy', 'foody', 'markyt', 'handy', 'gym', 'dental', 'clinic', 'vet'] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

/** available = on sale today · planned = in the works, no price · launch = has its own launch date · soon = «Próximamente». */
export type ProductStatus = 'available' | 'planned' | 'launch' | 'soon';

export interface Product {
  id: ProductId;
  status: ProductStatus;
  /** The plan level its «desde» price comes from (available products only). */
  fromLevel: string | null;
  launchDate?: string;
  /** What its screen summarizes: keys of `site.others.items.<id>.points`. */
  points: string[];
}

export const products = productsJson.products as Product[];
export const productById = (id: string) => products.find((p) => p.id === id);

/** The products the «otros negocios» section shows: everything except Roofy, which section 02 is about. */
export const otherProducts = products.filter((p) => p.id !== 'roofy');

/** How lit a product's status glyph is: ready = full sun, launching = a sliver left, in the works = mostly dark, coming = almost all dark. */
export const STATUS_PHASE: Record<ProductStatus, number> = { available: 0, launch: 0.3, planned: 0.72, soon: 0.9 };

/** A product's public launch date, written out for the locale ("10 de noviembre de 2026"). */
export function launchDate(product: Product, locale: Locale): string | null {
  if (!product.launchDate) return null;
  return new Intl.DateTimeFormat(localeTags[locale], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${product.launchDate}T12:00:00Z`),
  );
}
