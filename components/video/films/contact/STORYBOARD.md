# EstateOS · Contact — storyboard del tráiler (V1, segundo corte)

Duración **58 s** · **120 BPM** (1 compás = 2 s, grilla de semicorcheas de 0,125 s) · 16:9 (1920×1080) y 9:16 (1080×1920),
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
- **El precio del plan, solo en el cierre** (Ignacio, 27/10/2026): en pesos, con el dólar abajo y la fecha de la cotización
  (dólar MEP del 27/10/2026, `content/video-rates.json`). Ningún cupo. Los otros precios que se ven son de las propiedades
  ficticias de Lumen.
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
| 52–58 | `final` | Destello. Noche: glifo 1/6, «EstateOS», «Contact», «Producto base completo»; a 55,25 entra el precio: «$ 47.000/mes», debajo «USD 30/mes» y «Dólar MEP del 27/10/2026» (el poster) | |

## Música (120 BPM) — partitura propia, con alma

Primer intento: los estilos de Kinetic. Ignacio lo escuchó «sin música, sin alma»: había percusión y campanitas, pero los
versos no tenían melodía y el colchón estaba casi mudo.

Ahora toca la orquesta propia (`components/video/score/`): piano eléctrico, cuerdas, una voz solista, bajo, arpegio,
glockenspiel y batería. El motor de Kinetic queda solo para los sonidos de interfaz.

- **Tonalidad y armonía:** Re mayor, la progresión de canción D – A – Bm – G (I – V – vi – IV). El arranque va en Bm – G
  (el problema) y la puesta en marcha sube a Bm – G – D – A.
- **El gancho es el motivo de la marca:** seis notas, una por fase del eclipse (Re Mi Fa# La Si Re), que suben a la octava
  y contestan bajando.
  - En la revelación de la marca lo toca el piano, una vez.
  - En el estribillo del CRM lo canta la voz, doblada por el glockenspiel.
  - En el cierre firma con él.

| tiempo | parte | qué suena |
|---|---|---|
| 0–4 | gancho (Bm – G) | Un acorde grave, bombo y sub en cada palabra; las cuerdas crecen debajo; un riser y un platillo al revés llevan a la marca |
| 4–6 | marca (D) | Impacto y platillo; el acorde se abre en las cuerdas; el piano toca el motivo |
| 6–18 | verso (D A Bm G D A) | El piano acompaña en síncopa, bajo sostenido, batería liviana (bombo, palmas suaves, shaker); la voz canta la melodía del verso |
| 18–20 | subida (A) | Redoble que se acelera, riser, bajo en pedal; la última semicorchea queda en silencio |
| 20–34 | estribillo (D A Bm G D A G) | Bombo en negras con bombeo, palmas, hats, bajo en corcheas, arpegio; la voz canta el gancho con el glockenspiel; el último compás sube |
| 34–36 | subida (A) | Igual que la anterior, hacia la puesta en marcha |
| 36–48 | verso alto (Bm G D A Bm G) | Batería más llena, piano en corcheas, las cuerdas doblan la melodía (más aguda) |
| 48–52 | quiebre (G – A) | Sin batería: en cada palabra, un bombo, un sub y el acorde en el piano; el piano canta una nota por palabra y sube a la sensible; platillo al revés hacia el final |
| 52–58 | final (D) | Impacto, el acorde completo sostenido, la firma de seis notas en la voz y el glockenspiel; el Re vuelve a sonar cuando entra el precio (55,25); todo calla antes del último cuadro |

Efectos de interfaz, ≈ 9 dB por debajo de la música: un barrido por panel, un toque por dedo, una campanita (en la tonalidad)
por tarjeta que sale. Los golpes de palabra ya no llevan palma propia: el golpe lo da la música.
