# Publicación en `roofy.eclipse-business.com`

Lote 1.6 (27/10/2026). **Apagada.** El workflow `.github/workflows/hostinger.yml` siempre construye y prueba; solo
publica si el repositorio tiene `HOSTINGER_DEPLOY_ENABLED = true`. Nada se publicó todavía.

## Qué hace

1. **Build** (cada push y PR a `main`): `npm ci`, `npm audit --audit-level=high`, tests, lint, typecheck, build,
   `bash -n` de los scripts y artefacto `estateos-site` con `deploy/hostinger.htaccess` como `.htaccess`.
2. **Deploy** (solo `main`, nunca en PR, solo con la variable activada): sube el artefacto por SSH a una carpeta de
   staging, `scripts/hostinger-publish.sh` hace backup, copia los archivos y, si el chequeo público
   (`scripts/hostinger-smoke.sh`) falla, **restaura lo anterior**.

El script de publicación **rechaza** el `public_html` del sitio principal y cualquier carpeta que no sea la del
subdominio, exige que la carpeta ya exista, que el `.htaccess` previo sea de EstateOS (o no exista), que no haya
enlaces simbólicos y que el export esté completo. Usa su propia carpeta privada (`.eclipse-deploy-estateos`), separada
de la del sitio de Eclipse.

## Qué falta para activarla (lo hace Ignacio)

Ya está configurado en el workflow: el servidor, el puerto y el usuario de Hostinger (los mismos, públicos, que
usa el sitio de Eclipse) y, como valor por defecto, la carpeta `…/domains/eclipse-business.com/public_html/roofy`
(donde Hostinger pone un subdominio nuevo). Lo que **no se puede hacer desde el repositorio** y queda de tu lado:

1. **Secrets** (Settings → Secrets and variables → Actions → Secrets): `HOSTINGER_SSH_KEY` y
   `HOSTINGER_KNOWN_HOSTS`, con los mismos valores que en Eclipse-Web. Los secrets son por repositorio y no se
   pueden leer ni copiar desde acá.
2. **La carpeta del subdominio tiene que existir.** Si el subdominio está creado en hPanel con otra carpeta, cargar
   la variable `HOSTINGER_PATH`. Si la carpeta no existe, la publicación se detiene sin tocar nada.
3. **Entorno** `hostinger-estateos` (opcional: aprobación manual antes de publicar).
4. **Activar:** variable `HOSTINGER_DEPLOY_ENABLED = true` y «Run workflow» sobre `main` (o un push a `main`).

## Qué se probó y qué no

Probado (27/10/2026): el script de publicación contra un árbol de carpetas simulado (publicar, revertir, y los
rechazos: sitio principal, ruta inesperada, carpeta inexistente, export incompleto, `.htaccess` ajeno, enlace
simbólico, bloqueo activo); el chequeo público contra el export servido en local; la sintaxis del workflow.

**No probado:** Hostinger real (SSH, permisos de la carpeta, módulos de Apache como `mod_headers`, DNS/HTTPS del
subdominio). Desde este entorno el subdominio no es alcanzable. La primera publicación real es la prueba.

## Rollback

`rollback` restaura el backup de esa publicación (borra solo lo que la publicación agregó). Los backups quedan en
`<dominio>/.eclipse-deploy-estateos/backups/`.

## Mientras sea una publicación de prueba

`noindex` en las páginas, `robots.txt` con `Disallow: /` y `X-Robots-Tag`. Se quitan en el lote 3.9.
