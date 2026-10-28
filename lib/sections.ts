/**
 * The home's sections, in page order (docs/plan-sitio-comercial.md). The number and the phase of the eclipse come
 * from here: totality (1) at the first section, the full sun (0) at the last. A section that is not built yet
 * keeps its place, so the numbers never shift when it lands.
 */
export const SITE_SECTIONS = ['inicio', 'ofrecemos', 'demos', 'planes', 'otros-negocios'] as const;
export type SiteSection = (typeof SITE_SECTIONS)[number];

export const sectionNumber = (id: SiteSection): string => String(SITE_SECTIONS.indexOf(id) + 1).padStart(2, '0');

export const sectionPhase = (id: SiteSection): number => 1 - SITE_SECTIONS.indexOf(id) / (SITE_SECTIONS.length - 1);
