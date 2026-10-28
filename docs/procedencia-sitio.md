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

## Lote B2

| Archivo en roofy | Origen en Eclipse-Web | Cambios |
|---|---|---|
| `components/hero/Eclipse.tsx`, `Starfield.tsx`, `geometry.ts`, `useStarParallax.ts` | `components/hero/` | Ninguno |
| `components/hero/Dial.tsx` | `components/hero/Dial.tsx` | Una marca por plan (01–06, de `PLAN_IDS`) en vez de una por rubro; quieto (sin `useDial`) y sin el lector de abajo |
| `components/hero/HeroStage.tsx` | `components/hero/HeroStage.tsx` | Sin corona WebGL (`ogl` no es dependencia de roofy: la corona CSS es todo el eclipse), sin el estado del dial ni la capa de demo |
| `components/hero/useHeroMotion.ts` | `components/hero/useHeroMotion.ts` | Sin la entrada del loader (roofy no tiene loader: el hero es una imagen quieta desde el primer cuadro) y sin el bus de la corona |
| `components/hero/hero.css` | `components/hero/hero.css` | Sin el host de WebGL, el lector del dial ni los chips de rubros; el titular es propio (al final del archivo) |
| `components/hero/Hero.tsx` | `components/hero/Hero.tsx` (composición) | Reescrito: el H1 es el nombre («Eclipse» y debajo «para inmobiliarias»), una sola acción («Ver la demo») y la nota «Demo» |

## Escrito en roofy

`lib/landing-route.ts` (a dónde va cada enlace), `app/[locale]/page.tsx` y `components/site/site.css` (la home y la fila con el
nombre), `SiteNav` (`page`, `BackToEclipse`, `DemoLink`) y los textos `site.*`, `meta`, `demoMeta` y `home.toSite`.
