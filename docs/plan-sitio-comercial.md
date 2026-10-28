# Sitio comercial «Eclipse para inmobiliarias» (fase B)

Plan B0, aprobado por Ignacio el 28/10/2026. Roofy deja de arrancar en la demo y pasa a ser un sitio comercial propio, con
la estética Efemérides de Eclipse-Web. Un PR por lote, en serie (todos tocan `messages/*.json`, y roofy no tiene borradores).

## Decisiones por defecto (vigentes mientras Ignacio no diga otra cosa)

| # | Decisión | Valor |
|---|---|---|
| 1 | Nombre visible | «Eclipse para inmobiliarias» (en: «Eclipse for real estate»; pt: «Eclipse para imobiliárias»). Roofy vs EstateOS: abierto, ver `decisiones-abiertas.md` |
| 2 | Orden de la home | 01 hero · 02 producto · 03 demos · 04 planes · 05 otros negocios · pie |
| 3 | Rubros | Los 8 de `content/products.json` de Eclipse-Web, con su estado real (solo Roofy se vende) |
| 4 | Comercial «Eclipse en 40 segundos» y tour automático | No se replican; lote opcional posterior (el tour todavía no está en `main` de Eclipse-Web) |
| 5 | Corona del hero | Solo CSS, sin WebGL: `ogl` sería una dependencia nueva |
| 6 | Pruebas de navegador | Script local con el Playwright preinstalado; `@playwright/test` no se suma |
| 7 | Cotización | La de Eclipse-Web: dolarapi con un fallback fijo y fechado |

## Rutas

- `/<idioma>/` — el sitio.
- `/<idioma>/demo/` — la demo de Lumen a pantalla completa (lote 3.5), sin cambios de comportamiento.
- Un enlace a la home con `plan`, `vista` o `area` pasa a `/demo/` antes de pintar, con la query y el hash intactos
  (`docs/contrato-enlace.md` → «Dónde aterriza»). El contrato, su fixture y su digest no cambian.

## Wireframes

```
Escritorio                                                    Celular (360 px)
┌ Eclipse para inmobiliarias   ES·EN·PT ───────────┐          ┌ Eclipse para inm.  ES EN PT ┐
│ ◐ 01 INICIO                       ╭─────╮       │          │      ╭─────╮ eclipse        │
│ Eclipse para                      │  ◐  │ eclipse│          │ ◐ 01 INICIO                 │
│ inmobiliarias (serif enorme)      ╰─────╯       │          │ Eclipse para                │
│ Tu web, tu CRM y tus visitas…                   │          │ inmobiliarias               │
│ [ Ver la demo → ]  único ámbar sólido           │          │ [   Ver la demo →   ]       │
│ (DEMO) Lumen es una inmobiliaria ficticia       │          │ (DEMO) Lumen es ficticia    │
├ 02 PRODUCTO: 6 entregas en lista con lámina ────┤          ├ 02 lista vertical           │
├ 03 DEMOS: general + 6 planes, estado y video ───┤          ├ 03 filas apiladas           │
├ 04 PLANES: seis niveles, precio, ver demo / pedir┤          ├ 04 acordeón por nivel       │
├ 05 OTROS NEGOCIOS: 8 rubros con su estado ──────┤          ├ 05 una lámina por rubro     │
└ Volver a Eclipse · sitio de prueba ─────────────┘          └ pie                         ┘
```

## Lotes

| Lote | Qué | Estado |
|---|---|---|
| B1 | Base: demo a `/demo/`, home con la sección 01 y el pie, redirección de los enlaces de demo, motor de movimiento y clases de Eclipse-Web, noindex por página, smoke de Hostinger con `/demo/`, docs | Este PR |
| B2 | Hero con el eclipse en capas CSS, estrellas, una acción principal; header y menú móvil; «Eclipse para inmobiliarias» también en la demo | Pendiente |
| B3 | 02 Producto y 05 Otros negocios: `products.json` copiado con digest, láminas SVG (`ProductArt`, `artIdle`, `Walker`), estado honesto, sin precio salvo Roofy | Pendiente |
| B4 | 04 Planes: textos de cada nivel (`levels.json` copiado con digest en los dos repos), precio del catálogo en la moneda del visitante, «Ver la demo» primero y «Pedir este plan» por WhatsApp, Partner «Propuesta» | Pendiente |
| B5 | 03 Demos: general + seis planes con su estado (`PLAN_DEMO_STATUS`), «Ver el video» solo si existe; repaso de textos es/en/pt | Pendiente |
| B6 | QA: 360/1440 px, movimiento reducido, un solo ámbar, build en `/` y en `/roofy`, capturas, docs | Pendiente |

## Lo que necesita a Ignacio

- El número real de WhatsApp para el build (B4). No se pone uno inventado: sin él, «Pedir este plan» queda sin enlace y lo dice.
- Pages: *Settings → Pages → Source: GitHub Actions* y volver a correr el flujo.
