# EstateOS · Contact — storyboard del tráiler (V1, segundo corte)

Duración **56 s** · **120 BPM** (1 compás = 2 s, grilla de semicorcheas de 0,125 s) · 16:9 (1920×1080) y 9:16 (1080×1920),
la misma película armada para cada formato · español rioplatense con voseo (inglés y portugués, mismos tiempos).

Público: dueños de inmobiliarias que miran sin sonido. Nadie habla: el tráiler tiene que explicar **todo lo que recibe quien
contrata Contact**. Concepto: *consultas por todos lados → EstateOS → tu web, el chat guiado, tu CRM completo y tu marca puesta
en marcha → Contact, el producto base completo*.

## Reglas de contenido

- **Qué incluye Contact** (catálogo v3 y «Planes y cupos EstateOS», decisión de Ignacio del 26/10): la web profesional, el CRM
  completo (consultas, contactos, oportunidades, agenda, tareas, propiedades, roles), el chat guiado con botones (D20, sin IA) y
  la puesta en marcha con rebranding (kit de marca aplicado, auditoría de dos perfiles, hooks, videos de ejemplo y guía).
  Nada más.
- **Fuera de este video:**
  - El WhatsApp automático va en el video de Growth y el agente de voz en el de Escalar.
  - El portal del propietario, los mapas, Intelligence y el asistente quedan para sus planes.
- **Sin precios ni cupos** del plan dentro del video (el precio está en el HTML al lado del reproductor). Los precios que se ven
  son de las propiedades ficticias de Lumen.
- **Todo sale de la demo de Lumen:**
  - Personas, inmuebles, zonas, horarios y textos de la interfaz salen de `data.ts` y `demoRealEstate`.
  - Lo que cuenta el tráiler está en `video.contact`.
  - Ninguna función que la demo no tenga.
- **«Demo · datos ficticios»** en cada cuadro.
- **Lectura:** cada texto queda quieto al menos 1,2 s; ≤ 2,2 palabras por segundo; titulares cortos (≤ 4 palabras en los
  capítulos de 2 s).
- **Movimiento:** solo transform y opacity (clip-path en las revelaciones); todo en la línea de tiempo en tiempos absolutos;
  sin azar.

## Dirección de arte

- **Escenario de app:** piedra Lumen `#ECE8E1`, titular en tinta `#141414` (Geist 800, −0,045 em), la marca de capítulo como
  pastilla cobalto `#2448C8`.
  - **16:9:** titular a la izquierda y dispositivo a la derecha.
  - **9:16:** en la banda central (la interfaz de las plataformas tapa arriba y abajo): titular entre y 400 y 700, dispositivo
    debajo.
- **Golpes:** paneles de color de borde a borde que barren el cuadro (cobalto, piedra, tinta, arena); palabra en Geist 900 que
  pega de grande a su tamaño.
- **Noche de Eclipse** (`#05050A`) solo para la marca y el cierre; el ámbar `#F5B942` es la fase 1/6 del glifo: un ámbar por
  cuadro.
- **Dispositivos reconstruidos:**
  - Ventana de navegador (barra con URL de Lumen) para la web y el CRM; teléfono para el chat.
  - Lo importante **sale del dispositivo** como tarjeta grande (la lupa).
  - Un **dedo** (anillo de toque) marca cada toque.
- **Sonido:** el motor de Kinetic (`components/video/kinetic/`), pop en Re mayor, un motivo de seis notas (las seis fases).

## Escenas

| película | escena | qué pasa | texto |
|---|---|---|---|
| 0–4 | golpe `gancho` | Cuatro palabras, una por tiempo: paneles que barren; la primera ya está en el cuadro 0 | «¿Consultas por» / «todos lados?» · «¿Planillas que» / «nadie sigue?» |
| 4–6 | `marca` | Destello. Noche: el glifo en fase 1/6 (ámbar), «EstateOS», «Contact» | — |
| 6–14 | `web` (capítulo 1 · Tu web) | 6–8: la web de Lumen (encabezado, buscador, propiedades). 8–11: tres propiedades salen de la ventana como tarjetas grandes. 11–14: la ficha de Olmos 1420; el dedo toca «Agendar visita», elige Vie 9 · 18:30, confirma: «Visita agendada» ✓ | «Una web profesional.» · «Cada propiedad, con su ficha.» · «Te piden visitas desde ahí.» |
| 14–18 | `chat` (capítulo 2 · Chat guiado) | Teléfono: Carolina pregunta, el chat responde y ofrece botones; el dedo toca «Con crédito hipotecario»; la consulta sale del teléfono como tarjeta («Consulta nueva · Sitio web») | «Un chat guiado, siempre.» · «La consulta llega completa.» |
| 18–20 | golpe `giro` | «Y del otro lado,» / «tu CRM.» | |
| 20–34 | `crm` (capítulo 3 · CRM completo) | Ventana del CRM con la barra lateral: cada 2 s se ilumina un módulo y su pieza sale grande. Consultas (canales: sitio, WhatsApp, portales, cartel) · Contactos (ficha + historial) · Pipeline (Carolina pasa de Nuevo a Calificado) · Agenda (la visita del viernes cae en la semana) · Tareas (se tildan) · Propiedades (la cartera) · Equipo (dos roles y permisos) | «Todas tus consultas, juntas.» · «Cada contacto, su historia.» · «Cada oportunidad, su estado.» · «La agenda del equipo.» · «Tareas y recordatorios.» · «Tu cartera, ordenada.» · «Roles para tu equipo.» |
| 34–36 | golpe `marcha` | «Y lo ponemos» / «en marcha.» | |
| 36–48 | `marca-cliente` (capítulo 4 · Puesta en marcha) | 36–39: el kit de marca se arma (logo, paleta, tipografía). 39–42: la web pasa de la plantilla base a la marca (un borde que pasa). 42–45: la auditoría de dos perfiles (biografía, portada, destacados, botón de contacto) se tilda. 45–48: hooks, videos de ejemplo y la guía operativa en abanico | «Tu marca, en todo.» · «De plantilla a tu marca.» · «Revisamos tus redes.» · «Hooks, videos y una guía.» |
| 48–52 | golpe `resumen` | Una palabra por segundo: «Tu web.» · «Tu CRM.» · «Chat guiado.» · «Tu marca.» | |
| 52–56 | `final` | Destello. Noche: glifo 1/6, «EstateOS», «Contact», «Producto base completo». Desde 55 todo queda quieto (el poster) | |

## Música (120 BPM)

| tiempo | parte | |
|---|---|---|
| 0 | golpe (Bm) | el tráiler arranca pegando |
| 0–4 | latido (Bm – G) | el problema |
| 4 | golpe (D) | la marca |
| 4–6 | coro (D) con el motivo | |
| 6–18 | verso (D – A – Bm – G), con respuesta | la web y el chat |
| 18–20 | subida (A) | «Y del otro lado, tu CRM.» |
| 20 | golpe (D) · DROP | |
| 20–34 | coro (D – A – Bm – G) | el CRM |
| 34–36 | subida (A) | «Y lo ponemos en marcha.» |
| 36 | golpe (D) | |
| 36–48 | verso lleno | la marca |
| 48–52 | quiebre (G) con el motivo | el resumen |
| 52 | golpe (D) | |
| 52–54 | coro lleno (D) | |
| 54–56 | final (D) con la firma | nada suena después de 56 |

Efectos: un barrido por panel, una palmada por palabra, un toque por dedo, una campanita por tarjeta que sale.
