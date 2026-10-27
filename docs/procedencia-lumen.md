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
| `components/demos/real-estate/real-estate.css` | Estilos `.re-locked*` (3.5); esqueleto de la ficha, estado vacío de la transcripción y lugar para la × del chat (3.5b). |
| `components/demos/kit.tsx` | Exporta `kit/pace` y `kit/interaction` (3.5b). |
| `components/demos/kit/ChatWidget.tsx` | Las respuestas piensan y se escriben en tiempo real (`usePacedChat`), las opciones esperan a que la respuesta termine, el sello va junto al estado; `pace` y `paceKey` (3.5b). |
| `components/demos/real-estate/RealEstateDemo.tsx` | `PaceScopeProvider` (el ritmo de cada conversación se comparte entre vistas) y `ConfirmProvider` + `ConfirmToast` en la capa que está arriba (3.5b). |
| `components/demos/real-estate/story.ts` | `act.restoreMove` y `act.unbook` para «Deshacer» (3.5b). |
| `components/demos/real-estate/ui.tsx` | Sin el aviso de historia «Tu visita»: la reserva del visitante la confirma el aviso del kit o la respuesta de Lumi (3.5b). |
| `components/demos/real-estate/views/Inbox.tsx` | La transcripción comparte el ritmo con el chat del comprador; estado vacío con «Simular la consulta»; sello (3.5b). |
| `components/demos/real-estate/views/Site.tsx` | Reserva optimista con aviso y «Deshacer», destello, error simulado si el horario se ocupó, esqueleto al abrir una ficha, sello y `paceKey` (3.5b). |
| `components/demos/real-estate/views/Today.tsx` | Mover una tarjeta: aviso con «Deshacer» (3.5b). |
| `components/demos/real-estate/views/Followups.tsx` | Sello y `paceKey` (3.5b). |
| `components/demos/kit/SimBar.tsx`, `kit/AppShell.tsx` | `limit`: un plan ofrece solo los primeros beats (Contact termina en la visita) (3.6). |
| `components/demos/tourTypes.ts`, `real-estate/tour.ts` | `copy` en un paso de la guía; guía propia de Contact (`contactTour`) (3.6). |
| `components/demos/real-estate/data.ts` | Responsable de cada contacto, teléfonos ficticios (rango 5550), roles y permisos, tareas, antigüedad y orientación de cada propiedad, datos de la puesta en marcha de marca (3.6). |
| `components/demos/real-estate/story.ts` | Estado y acciones del CRM: tareas hechas y agregadas, notas, «ver como» (3.6). |
| `components/demos/real-estate/context.tsx` | `contact` y `openContact` (abrir una ficha desde cualquier área) (3.6). |
| `components/demos/real-estate/RealEstateDemo.tsx` | Áreas nuevas (Contactos, Tareas, Marca, Equipo), grupo «Cuenta», aviso «Estás viendo la cuenta como…», límite de beats por plan (3.6). |
| `components/demos/real-estate/views/Inbox.tsx`, `Today.tsx` | Chat guiado: solo las consultas del sitio dicen «respondida en N s»; en Contact el número clave cuenta el sitio (3.6). |
| `components/demos/real-estate/views/Site.tsx` | Ficha completa: descripción, detalles, quién te atiende, compartir y similares (3.6). |

## Archivos nuevos (no existen en Eclipse-Web)

- `components/demos/real-estate/lens.tsx`: contexto de la lente (`plan`, `lockedFrom`, `seePlan`); sin proveedor todo está abierto.
- `components/demos/real-estate/LockedArea.tsx`: «Desde <plan> · USD <precio>/mes» y «Ver demo de <plan>».
- `components/demos/kit/pace.ts`, `pacer.ts`, `interaction.tsx`, `interaction.css`: el kit de interacción premium (lote 3.5b,
  D34). Guía de uso: `docs/kit-interaccion.md`.
- `components/demos/real-estate/crm.ts` y `views/{Contacts,Tasks,Team,Brand}.tsx`: el CRM completo y la puesta en marcha de
  marca de Contact (lote 3.6). Qué muestra: `docs/demo-contact.md`.

## No se copió

`showcase.css` y `DeviceFrame` (el escenario de EstateOS es pantalla completa, D35: `components/experience/`), `DemoMessages`
(los mensajes de la demo viajan completos con la página), el registro de demos y las otras cinco demos.
