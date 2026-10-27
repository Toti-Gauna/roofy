# De dónde sale la demo de Lumen

Lote 3.5 de Eclipse v3 (27/10/2026). La demo de Lumen Propiedades, el kit de demos, el sonido y la guía vienen de
**Eclipse-Web** en el commit `206ced54a20553f769013a4ec1da339f6ab16675` (main). `docs/procedencia-lumen.json` lista cada
archivo copiado con su SHA-256: sirve para saber qué cambió en este repo y para traer arreglos de Eclipse-Web sin pisar lo propio.

No es una dependencia: es una copia que desde ahora evoluciona acá (lotes 3.5b–3.8d). Un arreglo que valga para las dos demos se
porta a mano mirando esta lista.

## Qué se cambió respecto de la copia

| Archivo | Cambio |
| --- | --- |
| `components/demos/types.ts` | Sin `DemoMeta` ni `@/lib/content` (EstateOS no tiene ese módulo). Queda `DemoProps`. |
| `components/demos/real-estate/data.ts` | Suma `LUMEN` (nombre del negocio y número clave): antes salían de `verticals.json` de Eclipse-Web. |
| `components/demos/real-estate/RealEstateDemo.tsx` | Lee `LUMEN` en vez de `verticalById`; aplica la lente de plan: marca con candado las áreas que el plan no incluye y muestra `LockedArea` en su lugar. |
| `components/demos/kit/AppShell.tsx` | `NavItem.badge` acepta `'lock'` (ícono de candado en el menú). |
| `components/demos/demo.css` | Regla `.demo-navlock`. |
| `components/demos/real-estate/real-estate.css` | Estilos `.re-locked*`. |

## Archivos nuevos (no existen en Eclipse-Web)

- `components/demos/real-estate/lens.tsx`: contexto de la lente (`plan`, `lockedFrom`, `seePlan`); sin proveedor todo está abierto.
- `components/demos/real-estate/LockedArea.tsx`: «Desde <plan> · USD <precio>/mes» y «Ver demo de <plan>».

## No se copió

`showcase.css` y `DeviceFrame` (el escenario de EstateOS es pantalla completa, D35: `components/experience/`), `DemoMessages`
(los mensajes de la demo viajan completos con la página), el registro de demos y las otras cinco demos.
