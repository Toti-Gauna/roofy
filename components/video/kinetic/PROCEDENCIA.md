# Procedencia: motor de sonido de Kinetic Studio

`audio.js` es copia **byte a byte** de `Toti-Gauna/kinetic-studio` en `30f1280` (`trailers/handy-anuncio/js/`, igual
a la de `trailers/handy-vertical/js/`): el sintetizador de los sonidos de interfaz (barridos, toques, campanitas) con
render sin conexión y semilla.

| Archivo | sha256 |
|---|---|
| `audio.js` | `87c2d4fac4e6b8643e879b999cce5b969fdfe465d2243cb82096e109c8475da2` |

La música ya no sale de Kinetic (`recipes-music.js` se quitó el 27/10/2026): Ignacio la escuchó sin alma (percusión y
campanitas, sin melodía en los versos). La toca la orquesta propia de `../score/` (piano eléctrico, cuerdas, voz
solista, bajo, arpegio, glockenspiel, batería), con una partitura por película.

No se editan acá: si hay que cambiar algo, se cambia en Kinetic Studio y se vuelve a copiar (con su hash nuevo).
`shim.ts` declara lo que el motor instala (`window.SFX`); `score.ts` pone los sonidos en la línea de tiempo GSAP y
mezcla su render con el de la música.
