#!/usr/bin/env bash
# Read-only public checks of the EstateOS test publication: no forms, no writes.
# SMOKE_BASE overrides the origin (default: the subdomain).
set -euo pipefail
base=${SMOKE_BASE:-https://roofy.eclipse-business.com}
fetch() {
  curl --fail --silent --show-error --retry 3 --retry-delay 5 --connect-timeout 15 --max-time 30 "$1"
}
fetch "$base/" >/dev/null
# The home (lote B1) and the Lumen demo, which lives at /<locale>/demo/ since then.
for locale in es en pt; do
  page=$(fetch "$base/$locale/")
  [[ "$page" == *'id="inicio"'* ]] || { echo "The $locale home does not look like the EstateOS site." >&2; exit 1; }
  [[ "$page" == *"location.replace(\"/$locale/demo/\""* ]] || { echo "The $locale home does not send demo links to /$locale/demo/." >&2; exit 1; }
  [[ "$page" == *'name="robots" content="noindex, nofollow"'* ]] || { echo "The $locale home is missing noindex." >&2; exit 1; }
  demo=$(fetch "$base/$locale/demo/")
  [[ "$demo" == *'data-demo-host'* ]] || { echo "The $locale demo does not look like the Lumen demo." >&2; exit 1; }
  [[ "$demo" == *'name="robots" content="noindex, nofollow"'* ]] || { echo "The $locale demo is missing noindex." >&2; exit 1; }
done
robots=$(fetch "$base/robots.txt")
[[ "$robots" == *'Disallow: /'* ]] || { echo 'robots.txt must disallow everything during the test publication.' >&2; exit 1; }
status=$(curl --silent --output /dev/null --write-out '%{http_code}' --connect-timeout 15 --max-time 30 "$base/nope/")
[[ "$status" == 404 ]] || { echo "Unknown paths must answer 404, got $status." >&2; exit 1; }
echo 'EstateOS test publication checks passed.'
