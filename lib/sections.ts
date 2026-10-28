/**
 * The home's sections that exist, in page order (docs/plan-sitio-comercial.md). The number and the phase of the eclipse
 * come from here: totality (1) at the first section, the full sun (0) at the last. The page never shows a gap in its
 * numbers: 03 Demos and 04 Planes join the list, between «ofrecemos» and «otros-negocios», when lotes B5 and B4 land.
 */
export const SITE_SECTIONS = ['inicio', 'ofrecemos', 'otros-negocios'] as const;
export type SiteSection = (typeof SITE_SECTIONS)[number];

export const sectionNumber = (id: SiteSection): string => String(SITE_SECTIONS.indexOf(id) + 1).padStart(2, '0');

export const sectionPhase = (id: SiteSection): number => 1 - SITE_SECTIONS.indexOf(id) / (SITE_SECTIONS.length - 1);
