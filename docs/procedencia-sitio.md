# Procedencia del sitio «Eclipse para inmobiliarias»

Qué se copió de Eclipse-Web para el sitio (fase B) y qué cambió. Origen: `Toti-Gauna/Eclipse-Web`, `main` en `5cdb887`
(28/10/2026). Si Eclipse-Web corrige uno de estos archivos, se vuelve a copiar y se anota acá.

## Lote B1

| Archivo en roofy | Origen en Eclipse-Web | Cambios |
|---|---|---|
| `components/motion/observeEnter.ts`, `idle.ts`, `Reveal.tsx`, `DrawLine.tsx`, `Occult.tsx`, `LightSweep.tsx`, `SectionHeading.tsx`, `CountUp.tsx` | `components/motion/` | Ninguno |
| `components/motion/gsap.ts` | `components/motion/gsap.ts` | Ninguno: ahora también registra `MotionPathPlugin` (viene con `gsap`, no es dependencia nueva) |
| `app/globals.css`: `:root`, `.theme-dark`, `.theme-light` y `@theme inline` | `app/globals.css` | Ninguno. Suma los tokens que roofy no tenía (`--corona-deep`, `--mist-ink`, `--dawn-soft`, `--surface`, `--surface-strong`, `--fg-inverse`, `--header-h`, `--ease-soft`) y los bloques de tema |
| `app/globals.css`: `.eyebrow`, `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-sm`, `.badge-demo`, `.grain`, `.sr-only-focusable`, `.no-scrollbar`, `.tabular`, `.ticks`, `.leader`, `.display em`, `.light-sweep-beam`, el bloque de movimiento reducido y la firma de movimiento (`.draw-line`, `[data-reveal]`, `[data-occult]`, el destello del botón) | `app/globals.css` | `.label` y `.readout` siguen siendo los de roofy (la demo los usa). No se copiaron `.card`, `.glass`, `<Sheet>`, el menú móvil ni `.cv-section`: se suman cuando un lote los use |

Efecto visible fuera del sitio: la guía de la demo (`components/ui/tour`, copiada de Eclipse-Web en el lote 3.5) usa
`btn btn-primary`, `btn btn-ghost`, `theme-light`, `--corona-deep` y `--mist-ink`, que no existían en roofy. Ahora se ve como en
Eclipse-Web: «Siguiente» es una píldora ámbar y «Anterior» una píldora con borde, en tinta sobre la tarjeta clara, y los
textos secundarios de la tarjeta toman su color AA (antes heredaban el del texto).

## Escrito en roofy

`lib/landing-route.ts` (a dónde va cada enlace), `app/[locale]/page.tsx` y `components/site/site.css` (la home), `SiteNav`
(`page`, `BackToEclipse`, `DemoLink`) y los textos `site.*`, `meta`, `demoMeta` y `home.toSite`.
