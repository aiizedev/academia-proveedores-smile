#!/usr/bin/env bash
# Tamaño descomprimido de una imagen y usuario de ejecución (arquitectura.md §7.4).
# Mide con `du` dentro de la imagen: igual con el almacén clásico o con containerd.
# Uso: image-size.sh <imagen> <max_mb>   · STRICT=1 falla si excede (POC: solo avisa)
set -euo pipefail
img="$1" max_mb="$2"
kb=$(docker run --rm --user 0 --entrypoint du "$img" -sxk / | cut -f1)
mb=$((kb / 1024))
user=$(docker image inspect "$img" --format '{{.Config.User}}')
echo "$img = ${mb} MB (límite ${max_mb} MB) · USER=${user:-root}"
if [ -z "$user" ] || [ "$user" = "root" ] || [ "$user" = "0" ]; then
  echo "  ✘ la imagen corre como root" >&2; exit 1
fi
if [ "$mb" -gt "$max_mb" ]; then
  echo "  ⚠ excede el límite de ${max_mb} MB" >&2
  [ "${STRICT:-0}" = "1" ] && exit 1
fi
exit 0
