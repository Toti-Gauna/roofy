# roofy · EstateOS

El sitio de **EstateOS**, la línea de Eclipse para inmobiliarias. Repositorio y subdominio propios
(`roofy.eclipse-business.com`); «roofy» es solo el nombre técnico.

Estado: **esqueleto del lote 1.6** — una página «en preparación», el contrato de enlace con Eclipse y la
publicación de prueba (apagada). La experiencia se construye en los lotes 3.5–3.9 de Eclipse v3.

```bash
npm ci
npm test        # contrato de enlace y mensajes
npm run build   # export estático en out/
npm run dev
```

- Reglas del proyecto y del stack: [`CLAUDE.md`](CLAUDE.md)
- Cómo se enlazan Eclipse y EstateOS: [`docs/contrato-enlace.md`](docs/contrato-enlace.md)
- Publicación: [`docs/despliegue.md`](docs/despliegue.md)
