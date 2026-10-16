#!/usr/bin/env bash
# Backup lógico de PostgreSQL (formato custom) en infra/backups/.
# RNF-REL-002 · PLAN_INFRA §I4
set -euo pipefail
source "$(dirname "$0")/_compose.sh"
mkdir -p "$INFRA_DIR/backups"
OUT="$INFRA_DIR/backups/smile-$(date +%Y%m%d-%H%M%S).dump"
compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc --no-owner > "$OUT"
echo "backup: $OUT ($(du -h "$OUT" | cut -f1))"
