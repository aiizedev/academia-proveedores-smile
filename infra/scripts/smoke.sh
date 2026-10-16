#!/usr/bin/env bash
# Prueba de humo del stack levantado: backend, frontend y almacenamiento S3 (SeaweedFS).
set -uo pipefail
source "$(dirname "$0")/_compose.sh"
fail=0
check() {
  local name="$1" url="$2"
  if code=$(curl -fsS -o /dev/null -w '%{http_code}' --max-time 5 "$url"); then
    printf '  ✔ %-18s %s (%s)\n' "$name" "$url" "$code"
  else
    printf '  ✘ %-18s %s\n' "$name" "$url"; fail=1
  fi
}
echo "Smoke test:"
check "backend live"   "http://localhost:${BACKEND_PORT:-8000}/health/live"
check "backend ready"  "http://localhost:${BACKEND_PORT:-8000}/health/ready"
check "openapi"        "http://localhost:${BACKEND_PORT:-8000}/api/v1/openapi.json"
check "frontend"       "http://localhost:${FRONTEND_PORT:-3000}/api/health"
check "storage"        "http://localhost:${STORAGE_S3_PORT:-9000}/healthz"
exit $fail
