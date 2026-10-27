@AGENTS.md

# EstateOS — el sitio de Eclipse para inmobiliarias (repo `roofy`)

Repositorio y subdominio propios de EstateOS (decisión D11 de Ignacio, 26/10/2026):
`roofy.eclipse-business.com`. «Roofy» es solo el nombre técnico del repo y del subdominio: el visitante ve
**EstateOS**. Nació en el lote 1.6 de Eclipse v3 como un esqueleto; desde el lote 3.5 muestra la demo de Lumen en pantalla completa
(ver `docs/v3/` en Eclipse-Web: biblia, guía de motion y lote 3.1 con las decisiones D28–D36).

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

## La experiencia (lote 3.5)

- `components/experience/`: `Experience` (escenario), `Entry` («¿Cómo la querés ver?»: «Ver con guía» / «Ver por mi cuenta»,
  se ofrece en CADA carga y no se recuerda nada), `PlanMenu` (lente de plan), `VideoPlayer` y `lens.ts`.
- **D35:** Lumen va a pantalla completa. Barra inferior: plan · «Ver la guía» · sonido · botón del celular (abajo a la derecha).
  Desde 1280 px el celular se acopla al escritorio y los dos comparten la misma historia; por debajo se ve una vista por vez
  (en un celular de verdad arranca el celular y el botón muestra el escritorio).
- **Lente de plan:** `?plan=<id>` o el menú de la barra. Sin plan = demo general (todo abierto). Con plan, las áreas que no
  incluye aparecen con candado y «Desde <plan> · USD <precio>/mes» + «Ver demo de <plan>». Nombres y precios salen de
  `content/estateos-plans.json` (copia del catálogo v3 de Eclipse-Web; `tests/plans.test.ts` fija su digest y Eclipse-Web fija el
  mismo): nunca se escribe un número en un componente. Qué área pide qué capacidad: `components/experience/lens.ts`.
- `PLAN_DEMO_STATUS` (`lib/plans.ts`) dice la verdad sobre el avance: mientras un plan esté `draft`, el escenario avisa que la
  demo todavía no muestra todo lo que incluye. Cada lote 3.6–3.8d pasa su plan a `built`.
- **Videos:** `content/estateos-videos.json` tiene el de Contact (V1); V2–V5 suman los suyos. El botón «Ver el video» y el
  reproductor (póster, 9:16 en pantallas verticales, sin sonido al empezar, subtítulos y transcripción en los tres idiomas, precio
  al lado, nunca autoplay, un medio a la vez) aparecen solo si hay un video para el plan en pantalla.
- La demo de Lumen es una copia de Eclipse-Web: `docs/procedencia-lumen.md` dice qué cambió.

## Demos por plan

- **Contact (lote 3.6, `built`):** web, CRM completo (Contactos con historial, Tareas, Equipo con dos roles y «Ver como»), chat
  guiado (D20) y puesta en marcha de marca (área «Marca»). La historia termina con la visita agendada (`beatLimitFor`); su guía es
  `contactTour`. Qué muestra: `docs/demo-contact.md`.
- El chat del sitio es **guiado** (botones, guion fijo) en todas las vistas: ningún plan vende un asistente con IA en el sitio.
  No escribas «IA»/«AI» en los textos de la demo (`tests/contact.test.ts`).
- Las áreas nuevas de cada plan se mapean a su capacidad en `components/experience/lens.ts` (`TAB_CAPABILITY`, `BEAT_CAPABILITY`).

## Videos (lote V1)

- La fábrica filma la demo real cuadro por cuadro: página de render solo en dev (`app/[locale]/render/page.dev.tsx`), piezas en
  `components/video/pieces/`, driver `scripts/render-video.mjs` (Playwright con reloj simulado + ffmpeg; sin dependencias
  nuevas). Guía: `docs/video-factory.md`.
- Ningún precio ni cupo dentro del video; el sello «Demo · datos ficticios» en cada cuadro; cada pieza filma solo lo que su
  plan incluye. El precio está en el HTML al lado del reproductor.
- `content/estateos-videos.json` es el registro y el manifest. Si cambia una pieza, el escenario o los textos `video.*`, hay que
  volver a renderizar (`tests/videos.test.ts` compara el `sourceHash`) y la aprobación de Ignacio vuelve a `null`.
- Mientras corre un render no edites `components/video/*` ni `messages/*`: el servidor de desarrollo recarga la página y el
  render se corta.

## Interacción premium (lote 3.5b, D34)

Toda demo de EstateOS usa el kit de `components/demos/kit` (`pace.ts`, `pacer.ts`, `interaction.tsx`): el asistente
piensa («Pensando la respuesta…», 1,2–2,5 s) y escribe de a poco (30–45 caracteres/s, tocar lo muestra entero); las
acciones son optimistas y se confirman con un aviso con «Deshacer»; éxito con destello una vez; errores simulados con
la salida a mano; vacíos con la acción; sello «Demostración guionada» / «Llamada simulada». Un solo estado de espera a
la vez, nada arranca solo, movimiento reducido sin pulso ni escritura. Guía: `docs/kit-interaccion.md`.

## Contrato de enlace con Eclipse-Web

`lib/handoff.ts` + `tests/fixtures/handoff-cases.json` (**el mismo archivo, byte a byte, en Eclipse-Web**).
Idioma por ruta (`/es/`, `/en/`, `/pt/`), moneda, vista y plan por query (`moneda`, `vista`, `area`, `plan`, `utm_*`).
Spec: `docs/contrato-enlace.md`. **Regla:** un cambio al contrato se hace en los dos repos en el mismo ciclo:
se copia el fixture, se recalcula el `digest` y se actualiza el test de cada lado. Valores fuera de las
listas permitidas se descartan; nunca se muestra ni se interpola lo recibido.

## Mientras sea publicación de prueba

- `noindex` en cada página, `robots.txt` con `Disallow: /` y `X-Robots-Tag` en `.htaccess`. Se quitan solo
  en el lote 3.9 (lanzamiento comercial), con el OK de Ignacio.
- El panel técnico «Prueba del enlace» se eliminó en el lote 3.5: la home es la demo.
- No hay formularios, cuentas, pagos ni envío de datos.
