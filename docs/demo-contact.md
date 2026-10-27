# Demo de Contact

Lote 3.6 de Eclipse v3 (27/10/2026). Contact es el plan base (USD 30/mes en el catálogo v3) y su demo muestra **todo** lo que
incluye (D33): la web pública, el CRM completo, el chat guiado (D20) y la puesta en marcha de marca. Se abre con `?plan=contact`
o eligiendo Contact en la barra. Todo es local: datos ficticios, nada se envía.

## Qué incluye y dónde se ve

| Capacidad (catálogo) | Dónde | Qué se puede hacer |
|---|---|---|
| `web` | Sitio web (en el celular: «Comprador») | Buscar, abrir una ficha completa (fotos, plano, mapa, descripción, detalles, quién te atiende, similares), compartirla y agendar una visita |
| `guided_chat` | El chat del sitio, Consultas | Responder con botones (cómo paga, cuánto invierte, día de visita); la consulta cae en el CRM. Sin IA ni WhatsApp |
| `crm_core` | Hoy, Consultas, **Contactos**, Pipeline, Visitas, **Tareas**, **Equipo** | Ficha de cada contacto con historial, notas y tareas; tareas por día con «hecha» y «Deshacer»; dos roles con permisos y «Ver como» |
| `setup_brand` | **Marca** | Entregables de la puesta en marcha: kit de marca, la web con y sin la marca, auditoría de dos perfiles, 12 hooks y 6 videos de ejemplo con guion, guía operativa |

## Lo que Contact no incluye (y cómo se ve)

- **Seguimientos por WhatsApp** (Growth): el área tiene candado con «Desde Growth · USD 75/mes» y la historia termina con la visita
  agendada (3 eventos en lugar de 5).
- **Producción mensual de videos y tours** (Growth): los 6 videos de Marca son ejemplos para grabar con el equipo, y lo dice.
- El número clave de «Hoy» cuenta solo las consultas del sitio: sin automatización de WhatsApp, solo el chat guiado responde solo.

## Honestidad

- El chat del sitio es **guiado** en todas las vistas de EstateOS (ningún plan vende un asistente con IA en el sitio);
  `tests/contact.test.ts` falla si vuelve a aparecer «IA»/«AI» en los textos de la demo.
- Teléfonos en el rango 5550 y emails `@correo.demo`: nada real.
- Una demo completa no es el producto: el catálogo sigue marcando Contact como objetivo (`target_not_available`).
