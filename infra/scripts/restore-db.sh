#!/usr/bin/env bash
# Restaura un backup de backup-db.sh sobre la base actual (DESTRUCTIVO).
# Uso: infra/scripts/restore-db.sh infra/backups/smile-AAAAMMDD-HHMMSS.dump
set -euo pipefail
# shellcheck source=infra/scripts/_compose.sh
source "$(dirname "$0")/_compose.sh"
FILE="${1:?Uso: restore-db.sh <archivo.dump>}"
[ -f "$FILE" ] || { echo "No existe: $FILE" >&2; exit 1; }
read -r -p "Esto reemplaza los datos de '$POSTGRES_DB'. Escribe 'restaurar' para continuar: " ok
[ "$ok" = "restaurar" ] || { echo "Cancelado."; exit 1; }
compose exec -T db pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner < "$FILE"
echo "restaurado: $FILE"
