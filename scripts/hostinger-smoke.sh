#!/usr/bin/env bash
# Read-only public checks of the EstateOS test publication: no forms, no writes.
# SMOKE_BASE overrides the origin (default: the subdomain).
set -euo pipefail
base=${SMOKE_BASE:-https://roofy.eclipse-business.com}
fetch() {
  curl --fail --silent --show-error --retry 3 --retry-delay 5 --connect-timeout 15 --max-time 30 "$1"
}
fetch "$base/" >/dev/null
for locale in es en pt; do
  page=$(fetch "$base/$locale/")
  [[ "$page" == *'EstateOS'* ]] || { echo "The $locale page does not look like EstateOS." >&2; exit 1; }
  [[ "$page" == *'name="robots" content="noindex, nofollow"'* ]] || { echo "The $locale page is missing noindex." >&2; exit 1; }
done
robots=$(fetch "$base/robots.txt")
[[ "$robots" == *'Disallow: /'* ]] || { echo 'robots.txt must disallow everything during the test publication.' >&2; exit 1; }
status=$(curl --silent --output /dev/null --write-out '%{http_code}' --connect-timeout 15 --max-time 30 "$base/nope/")
[[ "$status" == 404 ]] || { echo "Unknown paths must answer 404, got $status." >&2; exit 1; }
echo 'EstateOS test publication checks passed.'
