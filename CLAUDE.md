@AGENTS.md

# Roofy — el sitio de Eclipse para inmobiliarias (repo `roofy`)

Repositorio y subdominio propios de Roofy (antes EstateOS) (decisión D11 de Ignacio, 26/10/2026):
`roofy.eclipse-business.com`. Nació en el lote 1.6 de Eclipse v3 como un esqueleto; desde el lote 3.5 muestra la demo de Lumen en pantalla completa
(ver `docs/v3/` en Eclipse-Web: biblia, guía de motion y lote 3.1 con las decisiones D28–D36). Desde el lote B1 (28/10/2026) la
home es el sitio comercial y la demo vive en `/<idioma>/demo/` (ver «El sitio (fase B)»).

**Nombre (Ignacio, 28/10/2026):** el producto es **Roofy**, pero por ahora todo lo que el visitante ve del nombre es **«Eclipse»**
con el subtítulo **«para inmobiliarias»** debajo (en: «for real estate»; pt: «para imobiliárias»), en el sitio y en la demo. Lo
técnico que dice `EstateOS` (contrato de enlace, catálogo, archivos) no se renombra. El video de Contact todavía dice «EstateOS»
hasta que se vuelva a renderizar: `docs/decisiones-abiertas.md`.

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

## El sitio (fase B)

- Plan, decisiones por defecto y estado de los lotes B1–B6: `docs/plan-sitio-comercial.md`. Lo copiado de Eclipse-Web, con su
  commit de origen: `docs/procedencia-sitio.md`.
- Rutas: `/<idioma>/` es el sitio (`app/[locale]/page.tsx`); `/<idioma>/demo/` es la demo (`app/[locale]/demo/page.tsx`).
  Un enlace a la home con `plan`, `vista` o `area` pasa a `/demo/` antes de pintar (`lib/landing-route.ts`, contrato sin cambios).
- Enlaces: a la demo con `DemoLink` (conserva `moneda` y `utm_*`; `plan` abre la demo de ese plan); a la home con `siteHref`
  (nunca con `plan`, `vista` ni `area`, que rebotarían a la demo); a Eclipse con `BackToEclipse`. Todo pasa por `BASE_PATH`:
  el sitio tiene que funcionar bajo `/` (Hostinger) y bajo `/roofy` (Pages).
- Motor de movimiento y clases de Eclipse-Web (`components/motion/*`, `.btn`, `.ticks`, `.leader`, `[data-reveal]`…) ya están;
  `.label` y `.readout` siguen siendo los de roofy. Un solo ámbar sólido por pantalla: el CTA del hero lleva `data-hero-cta`.
- CSS del sitio al lado de sus componentes (`components/site/site.css`, `components/hero/hero.css`), no en `app/globals.css`.
- Hero (B2, `components/hero/`): eclipse en capas CSS (sin WebGL), dial con una marca por plan, estrellas con paralaje solo con
  mouse y la luna que se corre con el scroll (pin solo con mouse/trackpad en pantallas anchas; nunca en táctil). Movimiento
  reducido: quieto. El H1 es el nombre y nunca se oculta.

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

- **Método Kinetic Studio (guía de motion §0, corrección de Ignacio del 27/10/2026):** nada se filma. Los componentes se
  reconstruyen para el video (`components/video/ui/`), la película es una línea de tiempo GSAP en pausa movida por `seek`
  (`components/video/films/<plan>/`: `STORYBOARD.md`, `script.ts`, coreografía, `partitura.ts` a 120 BPM). Escenario solo
  en dev (`app/[locale]/trailer/page.dev.tsx`), driver `scripts/render-video.mjs`. Guía: `docs/video-factory.md`.
- **La música tiene que tener alma** (Ignacio, 27/10/2026): una composición con melodía, armonía y bajo, tocada por la
  orquesta propia (`components/video/score/`); el motor de Kinetic (`components/video/kinetic/`) queda para los sonidos
  de interfaz, por debajo de la música. Percusión y campanitas sin melodía no es música.
- **Cada video explica TODO lo que su plan entrega**, un capítulo por entrega (Contact: web, chat guiado, CRM módulo por módulo,
  puesta en marcha con la marca) y nada de lo que no incluye: WhatsApp automático va en el video de Growth y la voz en el de
  Escalar. `tests/video.test.ts` lo comprueba contra la lente (`lockedFromFor`).
- **Precio solo en el cierre** (Ignacio, 27/10/2026): en pesos, con el dólar abajo y la fecha de la cotización
  (`components/video/price.ts`). El monto sale del catálogo y la cotización de `content/video-rates.json`, fija y fechada: si se
  actualiza, se vuelve a renderizar. Ningún otro precio ni cupo dentro del video. Sello «Demo · datos ficticios» en cada cuadro;
  el precio sigue también en el HTML al lado del reproductor.
- `content/estateos-videos.json` es el registro y el manifest. Si cambia la película, el kit, los datos o textos de Lumen o
  `video.*`, hay que volver a renderizar (`tests/videos.test.ts` compara el `sourceHash`) y la aprobación de Ignacio vuelve a `null`.
- Antes de cada render completo: un cuadro por segundo en los dos formatos (`--stills --every=1`), revisado en hojas de contacto.
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
- El panel técnico «Prueba del enlace» se eliminó en el lote 3.5. Desde B1 la home es el sitio y la demo está en `/demo/`.
- No hay formularios, cuentas, pagos ni envío de datos.
