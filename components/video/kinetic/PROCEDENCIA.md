# Procedencia: motor de sonido de Kinetic Studio

`audio.js` y `recipes-music.js` son copias **byte a byte** de `Toti-Gauna/kinetic-studio` en `30f1280`
(`trailers/handy-anuncio/js/`, iguales a las de `trailers/handy-vertical/js/`). Son el sintetizador (voces, mezcla,
render sin conexión con semilla) y los estilos de música a tempo de los tráileres de Handy.

| Archivo | sha256 |
|---|---|
| `audio.js` | `87c2d4fac4e6b8643e879b999cce5b969fdfe465d2243cb82096e109c8475da2` |
| `recipes-music.js` | `25bae929e96976a3fed35241b49472cf2f2feb988026f6cb6262dc593edd395b` |

No se editan acá: si hay que cambiar algo, se cambia en Kinetic Studio y se vuelve a copiar (con su hash nuevo).
`shim.ts` instala lo único del motor de Kinetic que estos dos archivos necesitan (`Trailer.plugin`) y `score.ts`
programa la partitura en la línea de tiempo GSAP del tráiler y la renderiza sin conexión.
