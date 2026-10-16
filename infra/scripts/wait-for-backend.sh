#!/usr/bin/env bash
# Espera hasta que el backend responda /health/ready (máx. TIMEOUT segundos).
set -euo pipefail
# shellcheck source=infra/scripts/_compose.sh
source "$(dirname "$0")/_compose.sh"
URL="http://localhost:${BACKEND_PORT:-8000}/health/ready"
TIMEOUT="${TIMEOUT:-120}"
for ((i = 0; i < TIMEOUT; i += 2)); do
  if curl -fsS "$URL" >/dev/null 2>&1; then echo "backend listo: $URL"; exit 0; fi
  sleep 2
done
echo "backend no respondió en ${TIMEOUT}s: $URL" >&2
exit 1
