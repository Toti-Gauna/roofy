import { ECLIPSE_ORIGIN, ESTATEOS_ORIGIN } from '@/lib/handoff';

/** Public runtime configuration, inlined at build time. */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');

/** This site's own origin (canonical and hreflang URLs). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? ESTATEOS_ORIGIN).replace(/\/$/, '');

/** Where "Volver a Eclipse" points. */
export const ECLIPSE_URL = (process.env.NEXT_PUBLIC_ECLIPSE_URL ?? ECLIPSE_ORIGIN).replace(/\/$/, '');

export const absoluteUrl = (path: string): string => `${SITE_URL}${BASE_PATH}${path}`;
