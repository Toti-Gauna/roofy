# Kit de interacción premium (D34)

Lote 3.5b de Eclipse v3 (27/10/2026). Implementa el estándar de la guía de motion §12 (Eclipse-Web
`docs/v3/estateos/guia-motion.v1.md`) para **todas** las demos de EstateOS: Lumen ya lo usa y cada demo por plan
(lotes 3.6–3.8d) lo usa igual. Código: `components/demos/kit/{pace.ts, pacer.ts, interaction.tsx, interaction.css}`;
todo se importa desde `components/demos/kit`.

## Reglas (no se negocian)

- **Todo responde a algo que hizo el visitante. Nada arranca solo.**
- **Un solo estado de espera visible a la vez** (una respuesta piensa o se escribe; la siguiente espera su turno).
- **Los tiempos varían pero tienen techo**, y son deterministas por mensaje: el escritorio y el celular muestran la
  misma espera al mismo tiempo.
- **Movimiento reducido** = los mismos estados sin pulso ni desplazamiento: «Pensando…» quieto y la respuesta entera al
  terminar la espera; sin destello.
- **Ninguna espera bloquea** salir, volver ni cambiar de área: todo es local al componente que la muestra.
- El asistente y el agente llevan **siempre** su sello: `<Seal kind="scripted" />` («Demostración guionada») y
  `<Seal kind="simulatedCall" />` («Llamada simulada»).
- **Sonido** solo en acciones (`select`, `success`, `error`) y solo si el visitante lo activó (`useSound`).

## Estados y tiempos (`PACE` en `pace.ts`)

| Estado | Pieza del kit | Tiempo |
|---|---|---|
| Pensando | `ThinkingBubble` (lo pone `ChatWidget` solo) | 1,2–2,5 s, más largo para respuestas largas; dos seguidas nunca igual (±160 ms) |
| Escribiendo | `WrittenText` (lo pone `ChatWidget` solo) | 30–45 caracteres/s; la burbuja es un botón: tocar o Enter la muestra entera |
| Cargando | `useSimulatedLoad(clave)` + `Skeleton` con la forma final | ≤ 600 ms (por defecto 450) |
| Acción optimista | el cambio en el estado de la demo, al instante | — |
| Confirmación | `useConfirm()({ text, undo, icon })` + `<ConfirmToast />` | llega a los 450 ms; visible 3,6 s; se queda mientras el puntero o el foco estén encima |
| Éxito importante | `<Glint play={clave} />` | 760 ms, una vez |
| Error simulado | `<SimError action={…}>` | — |
| Vacío | `<EmptyState title body action />` | — |

## Cómo se usa en una demo

1. **Chat.** `ChatWidget` y `ChatPeek` ya piensan y escriben solos. Dales un `paceKey` (el nombre de la conversación) y
   envolvé la demo en `<PaceScopeProvider value={store}>`: todas las vistas de esa conversación (escritorio, celular,
   el chat chico y el grande, una transcripción) comparten el ritmo y quedan sincronizadas. Para una vista propia de la
   conversación (como la transcripción de Lumen) usá `usePacedChat(run, true, paceKey)`.
   - Lo que la conversación ya tenía la primera vez que se muestra, o lo que pasó mientras nadie la miraba, aparece
     entero (es historia, no se repite).
   - Si la historia (beats) ya mostró «escribiendo» antes de una respuesta, esa respuesta no vuelve a pensar.
   - `pace={false}` muestra la conversación tal cual (vistas previas).
2. **Acción con confirmación.** Hacé el cambio al instante (`store.update(...)`) y después
   `confirm({ text, undo, icon })`. Si el cambio ya se anunció en otra región viva (por ejemplo, el tablero), pasá
   `silent: true`. Montá un `<ConfirmToast />` por pantalla, en la capa que esté arriba (Lumen lo mueve a la capa del
   comprador cuando está abierta) y dentro de un `<ConfirmProvider>`.
3. **Error simulado.** Solo cuando hay un camino real para llegar (en Lumen: el horario que elegiste se ocupó mientras
   decidías). Decí qué pasó y cómo seguir, con la salida a mano («No hay lugar a las 12:00. Probá 14:30.» + «Agendar
   14:30»). Nunca un error técnico.
4. **Carga.** Solo donde una carga es creíble (abrir una página del sitio). Nunca en un cambio de pestaña de la app:
   es una acción frecuente y debe ser instantánea.

## Qué cubre en Lumen

Chat del comprador, chat propio del visitante en el sitio, seguimiento por WhatsApp y transcripción de la agencia
(piensan y escriben, sincronizados); reservar una visita en el sitio (optimista, aviso con «Deshacer», destello, error
si el horario se ocupó); mover una tarjeta del pipeline (aviso con «Deshacer»); abrir una ficha del sitio (esqueleto);
«Consultas» antes de la consulta de las 23:40 (vacío con «Simular la consulta»).

## Pruebas

`tests/pace.test.ts` (tiempos, orden de entrega, tocar para ver entero, movimiento reducido) y `tests/pacer.test.ts`
(tiempo real con relojes falsos: historia, quién mira, un solo estado de espera).
