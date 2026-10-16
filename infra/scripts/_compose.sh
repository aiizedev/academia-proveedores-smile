#!/usr/bin/env bash
# Helper compartido: ejecuta docker compose con los archivos del proyecto.
# Uso: source "$(dirname "$0")/_compose.sh"; compose ps
INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$INFRA_DIR/.env}"
[ -f "$ENV_FILE" ] || ENV_FILE="$INFRA_DIR/.env.example"
compose() { docker compose -f "$INFRA_DIR/docker-compose.yml" --env-file "$ENV_FILE" "$@"; }
# Carga variables para usarlas en los scripts (puertos, usuario DB…)
set -a; # shellcheck disable=SC1090
. "$ENV_FILE"; set +a
