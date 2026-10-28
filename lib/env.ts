import { ECLIPSE_ORIGIN, ESTATEOS_ORIGIN } from '@/lib/handoff';

/** Public runtime configuration, inlined at build time. */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');

/** This site's own origin (canonical and hreflang URLs). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? ESTATEOS_ORIGIN).replace(/\/$/, '');

/** Where "Volver a Eclipse" points. */
export const ECLIPSE_URL = (process.env.NEXT_PUBLIC_ECLIPSE_URL ?? ECLIPSE_ORIGIN).replace(/\/$/, '');

export const absoluteUrl = (path: string): string => `${SITE_URL}${BASE_PATH}${path}`;

/**
 * Eclipse's WhatsApp, digits only, with the country code (54 Argentina · 9 mobile · 223 · 4467881; Ignacio, 28/10/2026).
 * Public contact data, not a secret: `NEXT_PUBLIC_WHATSAPP` overrides it for a preview build.
 */
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP ?? '5492234467881').replace(/\D/g, '');
