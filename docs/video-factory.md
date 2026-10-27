# Fábrica de tráileres (lote V1, segundo corte)

Cómo se fabrican los videos de EstateOS (guía de motion v1, **§0 primero**: en Eclipse-Web
`docs/v3/estateos/guia-motion.v1.md`). El primero es **P1 · Contact**. V2–V5 usan el mismo kit: una carpeta nueva en
`components/video/films/<plan>/` con su guion, su coreografía y su partitura.

El primer corte filmaba la demo de Lumen con un reloj simulado. Ignacio lo rechazó el 27/10/2026: era una demo filmada,
pobre como presentación, y no explicaba todo lo que el cliente recibe. Este corte sigue el método de **Kinetic Studio**
(`Toti-Gauna/kinetic-studio`).

## El método (Kinetic Studio)

- **Componentes reconstruidos para el video.** Nada se filma: `components/video/ui/estate.tsx` vuelve a dibujar cada pieza
  (sitio, ficha, reserva, chat, CRM módulo por módulo, kit de marca, auditoría de redes, hooks, videos, guía) con los datos
  y los textos reales de Lumen (`components/demos/real-estate/data.ts`, `demoRealEstate`). El dispositivo
  (`ui/devices.tsx`) dibuja la interfaz más grande que en la web (×1,3 en la ventana, ×1,2 en el celular), porque el
  video se mira en un teléfono.
- **Una línea de tiempo GSAP en pausa, en segundos absolutos.** Cada cuadro es un `seek(t)` (como `?t=` en Kinetic): el
  mismo cuadro siempre, sin reloj simulado. Estados iniciales con `tl.set`, nunca `from`/`fromTo`; solo `transform`,
  `opacity` y `clip-path`.
- **El vocabulario** (`components/video/moves.ts`): golpes de palabras sobre paneles que barren el cuadro (con «mitad»),
  la etiqueta del capítulo, el titular que cae en el tiempo, la **lupa** (una tarjeta sale grande del dispositivo), el
  dedo que toca, el destello, el borde que pasa.
- **Storyboard antes de animar.** `films/<plan>/STORYBOARD.md`: un capítulo por cosa que el plan entrega, en el orden en
  que el cliente la usa, y nada de lo que el plan no incluye.
- **Partitura a tempo, con alma.** 120 BPM (un compás = 2 s): cortes y golpes caen en el tiempo.
  - La música es una composición por película: melodía, armonía, bajo y batería.
  - La toca una orquesta propia (`components/video/score/orquesta.ts`): piano eléctrico, cuerdas, voz solista, bajo,
    arpegio, glockenspiel y batería, con sala y eco.
  - El arreglador (`score/arreglo.ts`) convierte cada sección (estilo, acordes, melodía) en notas.
  - Los sonidos de interfaz son el motor de Kinetic (`kinetic/audio.js`, copia byte a byte, `PROCEDENCIA.md`), ≈ 9 dB
    por debajo de la música.
  - Todo se mezcla sin conexión, con semilla.
  - El primer intento con los estilos de música de Kinetic sonaba a percusión y campanitas sin melodía: Ignacio lo
    rechazó («no tiene alma»).
- **Sin dependencias nuevas:** GSAP ya estaba en el stack; Chromium y Playwright preinstalados; `ffmpeg` y `ffprobe`.

## Archivos

| Archivo | Qué hace |
|---|---|
| `app/[locale]/trailer/page.dev.tsx` | El escenario. Solo existe en `next dev` (`pageExtensions`): nunca llega al export |
| `components/video/FilmStage.tsx` | Monta la película, arma la línea de tiempo y expone `window.trailer` (seek, audio, subtítulos) |
| `components/video/film.ts` | Los dos encuadres (16:9 y 9:16): dónde van etiqueta, titular, dispositivos y lupa |
| `components/video/moves.ts` | Los movimientos del método |
| `components/video/ui/` | Dispositivos, piezas de EstateOS reconstruidas y su CSS |
| `components/video/score/` | La orquesta (instrumentos, sala, mezcla) y el arreglador (secciones → notas) |
| `components/video/kinetic/` | Los sonidos de interfaz de Kinetic y la mezcla final con la música (`score.ts`) |
| `components/video/films/contact/` | P1: `STORYBOARD.md`, `script.ts` (tiempos y palabras), `ContactFilm.tsx` (coreografía), `partitura.ts` |
| `components/video/timeline.ts` | Reglas de lectura y de subtítulos, WebVTT, formatos (puro, con pruebas) |
| `scripts/render-video.mjs` | El driver: cuadros → H.264, audio → −16 LUFS, poster, subtítulos, manifest, `--stills` |
| `scripts/video-source.mjs` | El hash del origen de una película (`sourceHash` del manifest) |
| `content/estateos-videos.json` | Registro del reproductor y manifest de cada archivo |

## Comandos

```bash
NEXT_DIST_DIR=.next-render npx next dev -p 3410             # servidor de render (otro distDir)
node scripts/render-video.mjs --film=contact --ratio=16x9   # 16:9, español
node scripts/render-video.mjs --film=contact --ratio=9x16   # 9:16 (entregado a 720 × 1280)
node scripts/render-video.mjs --film=contact --subs         # WebVTT es / en / pt
node scripts/render-video.mjs --film=contact --manifest     # entrada del registro (ffprobe, hashes, catálogo)
# Para dirigir:
node scripts/render-video.mjs --film=contact --ratio=16x9 --stills=.render/stills --every=1     # un cuadro por segundo
node scripts/render-video.mjs --film=contact --ratio=9x16 --stills=.render/stills --at=12.6,21.6
node scripts/render-video.mjs --film=contact --ratio=16x9 --reuse   # rehace solo audio, poster y mezcla
```

En el navegador: `http://localhost:3410/es/trailer/?film=contact&ratio=16x9&t=21.6` congela un cuadro.
`.render/` es descartable (está en `.gitignore`).

## Revisión cuadro a cuadro (antes de cada render completo)

Un cuadro por segundo en los dos formatos, en hojas de contacto. Lo que se buscó y se corrigió en este corte:
escenas que reaparecían (un `autoAlpha` pisaba la visibilidad de la escena), tarjetas lupa encogidas a su palabra más
larga, interfaz ilegible a 720p (de ahí el zoom de los dispositivos), reservas cortadas por el borde de la ventana,
ventanas vacías entre módulos del CRM (ahora el corte es en el tiempo), el dedo que reaparecía en cada toque
(ahora encadena), y el 9:16 cargado arriba (ahora en la banda central, fuera de la interfaz de las plataformas).

## Reglas que la fábrica hace cumplir

- `tests/video.test.ts`: la música es música (cada sección con imágenes tiene melodía, hay armonía debajo de
  cada segundo, cada golpe de palabra cae en un bombo, silencio en el último medio segundo); cada titular se sostiene lo necesario (1,2 s por línea de ≤ 6 palabras, ≤ 2,2 palabras/s) en
  los tres idiomas; los subtítulos entran en 2 líneas de ≤ 42 caracteres a ≤ 15 car/s; **la película muestra cada área que
  Contact abre y ninguna que no incluye** (contra `lockedFromFor` de la lente); la partitura cubre la película a 120 BPM
  y golpes y titulares caen en el tiempo; ningún texto del video tiene precios del plan ni «IA».
- `tests/videos.test.ts`: cada archivo del registro existe, pesa lo que dice y está dentro del peso objetivo; su
  `catalogVersion` es la vigente y su `sourceHash` coincide con el origen actual (la película, el kit, los datos y los
  textos de Lumen). Si algo cambia, la prueba falla hasta volver a renderizar (y `approvedAt` vuelve a `null`).

## Subtítulos

Sin locución todavía (la voz es del lote 3.4): los subtítulos repiten las palabras de pantalla en los tres idiomas. En
el reproductor se encienden solos cuando el visitante lee otro idioma que el de la imagen (español en V1).

## Mediciones (segundo corte)

- **Imagen determinista:** el mismo `seek` da el mismo cuadro; 8 de 8 cuadros comparados entre dos renders, idénticos byte
  a byte (md5 de los PNG).
- **Sonido casi determinista:** dos mezclas del mismo origen difieren en 1 bit en el 0,04 % de las muestras (≈ −96 dBFS,
  inaudible), por redondeo de coma flotante del `OfflineAudioContext`; el propio motor de Kinetic lo documenta. Por eso
  dos renders del mismo origen no dan el mismo sha256 del MP4: el manifest guarda el del archivo entregado.
- **Peso:** 16:9 a CRF 20 y AAC 128 kb/s; 9:16 (720 × 1280) a CRF 24 y AAC 96 kb/s, para entrar en sus 3 MB con 56 s.
- **Tiempo de render:** ≈ 2,5 min por formato de 56 s (1.680 cuadros) en este contenedor.
