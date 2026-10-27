# Fábrica de videos (lote V1)

Cómo se fabrican los videos de motion graphics de EstateOS (guía de motion v1 §5–§10, en Eclipse-Web
`docs/v3/estateos/guia-motion.v1.md`). El primero es **P1 · Contact** («Ninguna consulta se pierde»). Las piezas de
V2–V5 usan la misma fábrica: se agrega un archivo en `components/video/pieces/` y nada más.

## La idea

- **Se filma la demo de verdad.** La página de render monta Lumen tal cual y la mueve con sus propios controles: el
  botón «Simular» de la SimBar, la navegación y los botones de cada vista. No hay pantallas inventadas.
- **Cada plano es una toma.** Al empezar un plano se monta Lumen de cero y se reproduce fuera de cámara hasta el
  momento que el plano filma (los pasos con `at` negativo); después se filma. Así cada plano muestra su momento justo,
  como en un rodaje.
- **Cuadro por cuadro, siempre igual.** Playwright simula el reloj de la página (`page.clock`: temporizadores, `Date`,
  `requestAnimationFrame`) y lo avanza 1/30 s por cuadro. Las animaciones CSS y Web Animations no usan ese reloj; la
  página las fija al tiempo simulado en cada cuadro (`components/video/clock.ts`). La capa del video (marco,
  cámara, rótulos, anillo de toque, luz) es una función pura del tiempo (`components/video/timeline.ts`, con las
  curvas del sitio), sin línea de tiempo en reproducción.
- **Sin dependencias nuevas:** Chromium y Playwright preinstalados, `ffmpeg` y `ffprobe`.

## Archivos

| Archivo | Qué hace |
|---|---|
| `app/[locale]/render/page.dev.tsx` | Página de render. Solo existe en `next dev` (`pageExtensions`): nunca llega al export |
| `components/video/RenderStage.tsx` | El escenario: monta la toma, ejecuta los pasos, encuadra la cámara y expone `window.__video` al driver |
| `components/video/piece.ts` · `pieces/*.ts` | Qué es una pieza (planos, tomas, pasos) y cada pieza |
| `components/video/timeline.ts` | Curvas, formatos, reglas de lectura y de subtítulos, WebVTT (puro, con pruebas) |
| `components/video/clock.ts` | Fija las animaciones CSS al reloj simulado |
| `components/video/audio.ts` | Música y efectos del motor de sonido del sitio, renderizados sin conexión con semilla fija |
| `scripts/render-video.mjs` | El driver: cuadros → H.264, audio → −16 LUFS, poster, subtítulos, manifest, `--probe`, `--stills` |
| `scripts/video-source.mjs` | El hash del origen de una pieza (`sourceHash` del manifest) |
| `content/estateos-videos.json` | Registro del reproductor y manifest de cada archivo |
| `public/videos/<pieza>/` | Los MP4, los posters WebP y los subtítulos WebVTT |

## Comandos

```bash
NEXT_DIST_DIR=.next-render npx next dev -p 3410            # servidor de render (otro distDir)
node scripts/render-video.mjs --piece=contact --ratio=16x9  # 16:9, español
node scripts/render-video.mjs --piece=contact --ratio=9x16  # 9:16 (vistas del celular, compuesto aparte)
node scripts/render-video.mjs --piece=contact --subs        # WebVTT es / en / pt
node scripts/render-video.mjs --piece=contact --manifest    # entrada del registro (ffprobe, hashes, catálogo)
# Para dirigir:
node scripts/render-video.mjs --piece=contact --ratio=16x9 --stills=.render/stills --every=15 [--shot=chat]
node scripts/render-video.mjs --piece=contact --shot=pipeline --probe="<expresión JS>"   # cuándo cambia algo
node scripts/render-video.mjs --piece=contact --ratio=16x9 --reuse   # rehace solo audio, poster y mezcla
```

Un 16:9 de 36 s tarda unos 4 min (1.092 cuadros). `.render/` es descartable (está en `.gitignore`): los masters PNG
no se guardan porque el mismo comando los vuelve a producir idénticos.

## Mediciones de V1

- **Determinismo:** dos renders del plano del pipeline (con la tarjeta en vuelo) dan los 18 cuadros comparados
  idénticos byte a byte (md5).
- **Cuadros por segundo: 30.** La cámara se acerca como mucho un 3 % por plano con curva `IN_OUT`: el borde que más
  se mueve recorre ≈ 22 px en 4–8 s, con un pico de ≈ 0,3 px por cuadro a 30 fps, muy por debajo del píxel por
  cuadro en que aparece el temblor de un paneo. 60 fps duplicaría el tiempo de render y el peso sin diferencia visible.
- **Tiempos de la historia** (medidos con `--probe`, contados desde «Simular»): en el beat 2 Carolina responde «Con
  crédito» a los 0,5 s y el presupuesto a los 4,0 s (su tarjeta pasa a «Calificado»); en el beat 3 la visita cae a los
  3,0 s. Los pasos de `pieces/contact.ts` están puestos para que cada cosa pase en cámara.
- **Peso y sonido** de cada archivo: en el manifest (`content/estateos-videos.json`): bytes, fps, códec, duración,
  LUFS integrado y pico verdadero.

## Reglas que la fábrica hace cumplir

- `tests/video.test.ts`: cada rótulo se sostiene lo necesario (1,2 s por línea de ≤ 6 palabras, ≤ 2,2 palabras/s),
  la pieza dura lo que dice su ficha (± 5 s), los subtítulos entran en 2 líneas de ≤ 42 caracteres a ≤ 15 car/s, la
  pieza de Contact no reproduce más beats que los de Contact ni navega a Seguimientos, y ningún texto del video tiene
  precios ni «IA».
- `tests/videos.test.ts`: cada archivo del registro existe y pesa lo que dice, está dentro del peso objetivo, su
  `catalogVersion` es la vigente y su `sourceHash` coincide con el origen actual. Si cambia la pieza, el escenario o
  sus textos, la prueba falla hasta que se vuelve a renderizar (y `approvedAt` vuelve a `null`).

## Subtítulos

El video no tiene locución todavía (la voz es del lote 3.4): los subtítulos repiten las palabras que aparecen en
pantalla, en los tres idiomas. En el reproductor se encienden solos cuando el visitante lee otro idioma que el de la
imagen (español en V1); en español las palabras ya están en el cuadro y el subtítulo queda a un toque.
