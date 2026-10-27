@AGENTS.md

# EstateOS — el sitio de Eclipse para inmobiliarias (repo `roofy`)

Repositorio y subdominio propios de EstateOS (decisión D11 de Ignacio, 26/10/2026):
`roofy.eclipse-business.com`. «Roofy» es solo el nombre técnico del repo y del subdominio: el visitante ve
**EstateOS**. Nació en el lote 1.6 de Eclipse v3 como un esqueleto; la experiencia real se construye en los
lotes 3.5–3.9 (ver `docs/v3/` en Eclipse-Web).

Export estático (`output: 'export'`) en el subdominio (`NEXT_PUBLIC_BASE_PATH` vacío). Next 16 App Router +
TypeScript + Tailwind v4 + next-intl (es / en / pt). **Mismo stack, mismos tokens y mismas reglas que
Eclipse-Web**: si algo no está acá, manda su `CLAUDE.md`.

## Comandos

- `npm test` (Vitest) · `npm run typecheck` · `npm run lint` · `npm run build` (→ `out/`)
- `npm run dev` — servidor de desarrollo.
- Publicación: `docs/despliegue.md` (apagada hasta que Ignacio la active).

## Reglas que no se negocian (heredadas de Eclipse-Web)

- **Honestidad:** nada de testimonios, logos ni clientes que no existen. Todo negocio ficticio lleva la
  etiqueta visible **«Demo»**. Solo ofertas reales de `content/offers.json` de Eclipse-Web; en este repo no
  se copian precios: si EstateOS muestra uno, viene del catálogo versionado de Eclipse.
- **Tono:** premium, seguro, concreto. Frases cortas. Español rioplatense («vos»), portugués de Brasil
  natural, inglés simple y directo.
- **Sin texto fijo en componentes:** todo viene de `messages/{es,en,pt}.json` (`tests/messages.test.ts`
  exige las mismas claves en los tres).
- **Mobile-first:** sin scroll horizontal a 360 px, gutter de 16 px (`.container-x`), blancos táctiles ≥ 44 px.
- **Accesibilidad:** HTML semántico, teclado completo, foco visible (anillo ámbar global), contraste AA.
- **Movimiento reducido:** toda animación respeta `prefers-reduced-motion`. Solo `transform`, `opacity` y
  `clip-path`. Lo pesado (demos, WebGL, video) se carga bajo demanda.
- **Un solo ámbar sólido por pantalla.**
- **Sin dependencias nuevas** sin una razón fuerte (el esqueleto usa las mismas que Eclipse-Web, menos GSAP/OGL).

## Contrato de enlace con Eclipse-Web

`lib/handoff.ts` + `tests/fixtures/handoff-cases.json` (**el mismo archivo, byte a byte, en Eclipse-Web**).
Idioma por ruta (`/es/`, `/en/`, `/pt/`), moneda y vista por query (`moneda`, `vista`, `area`, `utm_*`).
Spec: `docs/contrato-enlace.md`. **Regla:** un cambio al contrato se hace en los dos repos en el mismo ciclo:
se copia el fixture, se recalcula el `digest` y se actualiza el test de cada lado. Valores fuera de las
listas permitidas se descartan; nunca se muestra ni se interpola lo recibido.

## Mientras sea publicación de prueba

- `noindex` en cada página, `robots.txt` con `Disallow: /` y `X-Robots-Tag` en `.htaccess`. Se quitan solo
  en el lote 3.9 (lanzamiento comercial), con el OK de Ignacio.
- El panel «Prueba del enlace» de la home (`components/HandoffPanel.tsx`) es técnico y se elimina en el lote 3.5.
- No hay formularios, cuentas, pagos ni envío de datos.
