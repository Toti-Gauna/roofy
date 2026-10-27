# Contrato de enlace Eclipse ↔ EstateOS

Lote 1.6 de Eclipse v3 (27/10/2026). Vale para los dos sitios: `eclipse-business.com` (Eclipse-Web) y
`roofy.eclipse-business.com` (este repo). Son **orígenes distintos**: no comparten `localStorage` ni cookies, así que
lo que el visitante eligió en Eclipse viaja en la URL.

## Qué viaja y cómo

| Dato | Dónde | Valores | Si falta o es inválido |
| --- | --- | --- | --- |
| Idioma | Ruta: `/es/`, `/en/`, `/pt/` | `es`, `en`, `pt` | La raíz `/` redirige al idioma del navegador y **conserva query y hash** |
| Moneda | `?moneda=` | `ARS`, `BRL`, `USD` (mayúsculas) | La del idioma: `es` → ARS, `pt` → BRL, `en` → USD |
| Vista | `?vista=` | `entrada`, `guia`, `branding`, `intelligence`, `academy` | `entrada` |
| Área | `?area=` | `recepcion`, `administracion`, `ventas`, `marketing` | Ninguna. Solo existe dentro de `vista=guia`; con otra vista se descarta |
| Campaña | `?utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` | `[A-Za-z0-9_.-]{1,100}` | Se descarta |

Reglas comunes:

- **Orden fijo** al construir: `moneda`, `vista`, `area`, `utm_*` (en el orden de la tabla). Sin parámetros no hay `?`.
- **Listas cerradas.** Cada valor se compara con una constante y se usa la constante; lo recibido nunca se muestra, se
  interpola en HTML ni se arma en un `href`. Mayúsculas y minúsculas importan: `moneda=ars` no vale.
- **Si un parámetro se repite, gana el primero.**
- **Parámetros ajenos** (`fbclid`, `gclid`, …) no se tocan: al limpiar la URL van primero y sin cambios, como en el
  showroom de Eclipse-Web.
- **Este lado es tolerante.** Un enlace de afuera nunca termina en un error: lo que no se entiende se descarta y la URL
  se limpia con `history.replaceState` (sin agregar una entrada al historial).
- **Sin datos del visitante.** Nada de nombres, teléfonos, emails, tokens ni identificadores en la URL.

## Ida y vuelta

- **Eclipse → EstateOS:** `https://roofy.eclipse-business.com/<idioma>/?moneda=…&vista=…&area=…&utm_…`
  (`estateosUrl()` en Eclipse-Web, `buildEstateosUrl()` acá).
- **EstateOS → Eclipse:** `https://eclipse-business.com/<idioma>/?moneda=…#<sección>`
  (`buildEclipseUrl()` acá). Secciones permitidas: `inicio`, `servicios`, `pyme`, `ejemplos`, `precios`, `problema`,
  `proceso`, `contacto`. Eclipse-Web lee `moneda` con `currencyFromEstateos()`.
- En EstateOS los links de cambio de idioma conservan lo recibido (`cleanSearch()`), y «Volver a Eclipse» devuelve la
  moneda solo si la visita venía con una moneda explícita (no inventa una elección).

## Estado

| Lado | Código | Cableado |
| --- | --- | --- |
| EstateOS (`lib/handoff.ts`) | Hecho, con panel de prueba en la home | Sí: lee el enlace y lo muestra |
| Eclipse-Web (`lib/estateos-link.ts`) | Hecho, con pruebas | **No:** la fila «Inmobiliarias» del selector sigue abriendo la demo de Lumen hasta que EstateOS esté publicado (D11). Se cablea en los lotes 3.5–3.9; leer `moneda` al volver se suma ahí |

## Cómo se mantiene

`tests/fixtures/handoff-cases.json` es **el mismo archivo** en los dos repos y trae su propio `digest` (SHA-256 de
`JSON.stringify(cases)`). Cada repo prueba sus dos direcciones contra ese archivo; el test de Eclipse-Web además
fija el digest esperado. Para cambiar el contrato:

1. Editar `lib/handoff.ts` y el fixture en este repo; recalcular el `digest`.
2. Copiar el fixture a Eclipse-Web, actualizar `lib/estateos-link.ts` y el digest esperado en su test.
3. Los dos PRs salen juntos. Si un lado queda atrás, falla su test.

Digest vigente: `144cfcafffb37a6faeca82db70695495799bf36542dcd9abde44eca092182597`.
