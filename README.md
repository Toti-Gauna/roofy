# roofy · EstateOS

El sitio de **EstateOS**, la línea de Eclipse para inmobiliarias. Repositorio y subdominio propios
(`roofy.eclipse-business.com`); «roofy» es solo el nombre técnico.

Estado: la home es el sitio comercial «Eclipse para inmobiliarias» (fase B, en construcción: `docs/plan-sitio-comercial.md`)
y la demo de Lumen está en `/<idioma>/demo/` (lotes 3.5–3.6). Publicación de prueba: GitHub Pages bajo `/roofy`; Hostinger,
apagada.

```bash
npm ci
npm test        # contrato de enlace, rutas, planes, videos y mensajes
npm run build   # export estático en out/
npm run dev
```

- Reglas del proyecto y del stack: [`CLAUDE.md`](CLAUDE.md)
- Cómo se enlazan Eclipse y EstateOS: [`docs/contrato-enlace.md`](docs/contrato-enlace.md)
- Publicación: [`docs/despliegue.md`](docs/despliegue.md)
