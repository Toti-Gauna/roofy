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
| ~~`components/hero/Dial.tsx`~~ | `components/hero/Dial.tsx` | Se copió y se quitó en el mismo lote: Eclipse-Web lo ocultó (76767ea, «el eclipse solo», Ignacio, 28/10/2026) |
| `components/hero/HeroStage.tsx` | `components/hero/HeroStage.tsx` | Sin corona WebGL (`ogl` no es dependencia de roofy: la corona CSS es todo el eclipse), sin el estado del dial ni la capa de demo |
| `components/hero/useHeroMotion.ts` | `components/hero/useHeroMotion.ts` | Sin la entrada del loader (roofy no tiene loader: el hero es una imagen quieta desde el primer cuadro) y sin el bus de la corona |
| `components/hero/hero.css` | `components/hero/hero.css` (5cdb887 + el hero alto en celular de 76767ea) | Sin el host de WebGL, el dial ni los chips de rubros; el titular y el botón secundario son propios (al final del archivo) |
| `components/hero/Hero.tsx` | `components/hero/Hero.tsx` (composición) | Reescrito: el H1 es el nombre («Eclipse» y debajo «para inmobiliarias»), «Ver qué ofrecemos» (ámbar, arranca el tour), «Probar la demo» y la nota «Demo» |
| `app/globals.css`: `--header-h` 72 px y el grano sin mezcla en pantallas táctiles | `app/globals.css` (76767ea) | Ninguno (la mezcla dejaba secciones negras en iPhone) |
| `components/tour/autoTour.ts` | `components/tour/autoTour.ts` (76767ea) | Las paradas son los `[data-tour-stop]` de la página (no una lista fija de secciones) y se salta una parada a menos de media pantalla de la anterior (`pickStops`, probado); sin cabecera fija ni analytics |
| `components/tour/AutoTourButton.tsx`, `auto-tour.css` | `components/tour/` (76767ea) | Los textos llegan por props; suma `TourStartLink` (el enlace que arranca el tour, como la tecla del hero de Eclipse-Web) |
| `components/sections/products/ProductArt.tsx`, `Walker.tsx`, `artMotion.ts`, `artIdle.ts` | `components/sections/products/` (76767ea) | Ninguno, salvo el tipo `ProductId` (`lib/products.ts`) |
| `components/sections/products/plate.css` | `components/sections/products/products.css` (76767ea): «Plate» y `.pd-mover` | Sin `order: -1` (el orden lo pone la sección) |
| Textos de 02 Qué ofrecemos (`site.offer.lead`, `features`, `start`) y `autoTour` | `messages/*.json` (76767ea): `products.items.roofy` y `autoTour` | Ninguno; el título de la sección es propio |

## Lote B3

| Archivo en roofy | Origen en Eclipse-Web | Cambios |
|---|---|---|
| `content/products.json` | `content/products.json` (76767ea) | Ninguno, byte a byte. `tests/products.test.ts` fija su digest; si cambia allá, se copia acá y se actualiza el digest |
| `lib/products.ts` | `lib/content.ts` (tipos de producto) y `components/sections/products/products.ts` (`STATUS_PHASE`, `launchDate`) | Sin niveles ni precios: el «desde» de Roofy se lee del catálogo en B4 |
| `lib/whatsapp.ts` | `lib/whatsapp.ts` | Solo `whatsappUrl`; el número es `WHATSAPP_NUMBER` en `lib/env.ts` (5492234467881, Ignacio, 28/10/2026) |
| Textos `site.others.items.*`, `status`, `noPrice`, `soonNote`, `notify`, `ask` | `messages/*.json`: `products.items.<id>`, `products.status`, `products.page` (76767ea) | Ninguno; el título, el sub y la nota «Se abre en WhatsApp» son propios. No se copiaron `lead`, `features`, `start` ni `later`: la sección no los muestra |

Las láminas de los siete rubros ya estaban desde B2 (`ProductArt.tsx` trae las ocho).

## Escrito en roofy

`lib/landing-route.ts` (a dónde va cada enlace), `app/[locale]/page.tsx` y `components/site/site.css` (la home y la fila con el
nombre), `components/site/Others.tsx` (la lista con vista previa), `SiteNav` (`page`, `BackToEclipse`, `DemoLink`) y los textos `site.*`, `meta`, `demoMeta` y `home.toSite`.
