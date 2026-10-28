# Decisiones abiertas

Lo que espera una respuesta de Ignacio. Mientras tanto rige el valor «por ahora»; nada de esto se resuelve en un PR.

| Tema | Por ahora | Qué falta decidir | Desde |
|---|---|---|---|
| El video de Contact dice «EstateOS» | El sitio y la demo ya dicen «Eclipse» + «para inmobiliarias»; el video renderizado (V1) todavía muestra «EstateOS» (`video.brand`). Cambiarlo obliga a volver a renderizar (`tests/videos.test.ts`) y la aprobación del video vuelve a `null` | Cuándo se vuelve a renderizar: como paso propio (render, hojas de contacto, aprobación) | 28/10/2026 |

## Resueltas

| Tema | Decisión | Fecha |
|---|---|---|
| Nombre | El producto es **Roofy** (repo y subdominio `roofy`). Por ahora, todo lo que el visitante ve del nombre es **«Eclipse»** y debajo, como subtítulo, **«para inmobiliarias»** (en: «for real estate»; pt: «para imobiliárias»). Lo técnico que dice `EstateOS` (`ESTATEOS_ORIGIN`, `estateos-plans.json`, nombres de archivos) no se renombra: no lo ve nadie y es parte del contrato con Eclipse-Web | Ignacio, 28/10/2026 |
| Número de WhatsApp | 223 446-7881 (Mar del Plata). En formato de wa.me: `5492234467881` (54 Argentina · 9 celular · 223 · 4467881). Ya se usa en B3 («Avisame cuando esté») y se usará en B4 («Pedir este plan»); `NEXT_PUBLIC_WHATSAPP` lo pisa en una vista previa | Ignacio, 28/10/2026 |
| Publicación de prueba | GitHub Pages activo: `https://toti-gauna.github.io/roofy/` (run del merge de B1 en verde). Hostinger sigue apagado | Ignacio, 28/10/2026 |
