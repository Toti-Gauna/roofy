# Contrato de enlace Eclipse ↔ EstateOS

Lote 1.6 de Eclipse v3 (27/10/2026); `plan` se sumó en el lote 3.5 (27/10/2026). Vale para los dos sitios: `eclipse-business.com` (Eclipse-Web) y
`roofy.eclipse-business.com` (este repo). Son **orígenes distintos**: no comparten `localStorage` ni cookies, así que
lo que el visitante eligió en Eclipse viaja en la URL.

## Qué viaja y cómo

| Dato | Dónde | Valores | Si falta o es inválido |
| --- | --- | --- | --- |
| Idioma | Ruta: `/es/`, `/en/`, `/pt/` | `es`, `en`, `pt` | La raíz `/` redirige al idioma del navegador y **conserva query y hash** |
| Moneda | `?moneda=` | `ARS`, `BRL`, `USD` (mayúsculas) | La del idioma: `es` → ARS, `pt` → BRL, `en` → USD |
| Vista | `?vista=` | `entrada`, `guia`, `branding`, `intelligence`, `academy` | `entrada` |
| Área | `?area=` | `recepcion`, `administracion`, `ventas`, `marketing` | Ninguna. Solo existe dentro de `vista=guia`; con otra vista se descarta |
| Plan | `?plan=` | `contact`, `growth`, `escalar`, `hipergrowth`, `deluxe`, `partner` (minúsculas, los ids del catálogo) | Ninguno: la demo general (todas las áreas abiertas). Con un plan, la demo muestra las áreas que ese plan incluye y las demás aparecen bloqueadas con «Desde <plan> · USD <precio>/mes» |
| Campaña | `?utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` | `[A-Za-z0-9_.-]{1,100}` | Se descarta |

Reglas comunes:

- **Orden fijo** al construir: `moneda`, `vista`, `area`, `plan`, `utm_*` (en el orden de la tabla). Sin parámetros no hay `?`.
- **Listas cerradas.** Cada valor se compara con una constante y se usa la constante; lo recibido nunca se muestra, se
  interpola en HTML ni se arma en un `href`. Mayúsculas y minúsculas importan: `moneda=ars` no vale.
- **Si un parámetro se repite, gana el primero.**
- **Parámetros ajenos** (`fbclid`, `gclid`, …) no se tocan: al limpiar la URL van primero y sin cambios, como en el
  showroom de Eclipse-Web.
- **Este lado es tolerante.** Un enlace de afuera nunca termina en un error: lo que no se entiende se descarta y la URL
  se limpia con `history.replaceState` (sin agregar una entrada al historial).
- **Sin datos del visitante.** Nada de nombres, teléfonos, emails, tokens ni identificadores en la URL.

## Ida y vuelta

- **Eclipse → EstateOS:** `https://roofy.eclipse-business.com/<idioma>/?moneda=…&vista=…&area=…&plan=…&utm_…`
  (`estateosUrl()` en Eclipse-Web, `buildEstateosUrl()` acá).
- **EstateOS → Eclipse:** `https://eclipse-business.com/<idioma>/?moneda=…#<sección>`
  (`buildEclipseUrl()` acá). Secciones permitidas: `inicio`, `servicios`, `pyme`, `ejemplos`, `precios`, `problema`,
  `proceso`, `contacto`. Eclipse-Web lee `moneda` con `currencyFromEstateos()`.
- En EstateOS los links de cambio de idioma conservan lo recibido (`cleanSearch()`), y «Volver a Eclipse» devuelve la
  moneda solo si la visita venía con una moneda explícita (no inventa una elección).

## Dónde aterriza (lote B1, 28/10/2026)

Desde el lote B1 la home `/<idioma>/` es el sitio «Eclipse para inmobiliarias» y la demo de Lumen vive en
`/<idioma>/demo/`. **El contrato no cambió:** los enlaces se siguen armando como `/<idioma>/?…`, el fixture y su
`digest` son los mismos y Eclipse-Web no tiene que tocar nada.

- Si la query trae `plan`, `vista` o `area` (con cualquier valor), un script en línea, lo primero de la home, manda
  la visita a `/<idioma>/demo/` con la query y el hash intactos, con `location.replace` (Atrás no rebota) y antes de
  pintar nada. La demo filtra los valores como siempre. Las claves salen de una constante, nunca de lo recibido
  (`lib/landing-route.ts`; `tests/landing-route.test.ts` lo prueba contra cada enlace del fixture).
- `moneda` y `utm_*` solos se quedan en la home, que los conserva en sus enlaces a la demo y en los de idioma.
- Desde la demo, «Ir al sitio» vuelve a la home con `moneda` y `utm_*`, sin `plan`, `vista` ni `area` (si no,
  rebotaría a la demo).
- Si algún día Eclipse quiere apuntar directo a `/demo/`, eso **sí** es un cambio de contrato: va a los dos repos
  en el mismo ciclo.

## Estado

| Lado | Código | Cableado |
| --- | --- | --- |
| EstateOS (`lib/handoff.ts`) | Hecho (`plan` desde el lote 3.5) | Sí: `?plan=` abre la demo con esa lente (desde B1, pasando de la home a `/demo/`); al elegir otro plan en la barra, la URL se actualiza con `replaceState` y se puede compartir. `vista` y `area` se leen y se limpian, pero todavía no mueven la demo (lotes 3.6–3.8d) |
| Eclipse-Web (`lib/estateos-link.ts`) | Hecho, con pruebas | **No:** la fila «Inmobiliarias» del selector sigue abriendo la demo de Lumen hasta que EstateOS esté publicado (D11). Se cablea en los lotes 3.5–3.9; leer `moneda` al volver se suma ahí |

## Cómo se mantiene

`tests/fixtures/handoff-cases.json` es **el mismo archivo** en los dos repos y trae su propio `digest` (SHA-256 de
`JSON.stringify(cases)`). Cada repo prueba sus dos direcciones contra ese archivo; el test de Eclipse-Web además
fija el digest esperado. Para cambiar el contrato:

1. Editar `lib/handoff.ts` y el fixture en este repo; recalcular el `digest`.
2. Copiar el fixture a Eclipse-Web, actualizar `lib/estateos-link.ts` y el digest esperado en su test.
3. Los dos PRs salen juntos. Si un lado queda atrás, falla su test.

Digest vigente: `f66d6ee102d306fef6e9cc6222edf8abec3a5d628764c6470803086692e05665` (antes del lote 3.5: `144cfcaf…2597`).
