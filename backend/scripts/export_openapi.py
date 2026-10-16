"""Exporta el contrato OpenAPI de FastAPI a `contracts/openapi.json` (HU-PLAT-05, RNF-MNT-004).

Uso: `uv run python scripts/export_openapi.py [--check]`. Con `--check` no escribe:
falla (código 1) si el archivo versionado difiere de la API actual.
"""

import json
import sys
from pathlib import Path

from smile.main import create_app

TARGET = Path(__file__).resolve().parents[2] / "contracts" / "openapi.json"


def render() -> str:
    # Claves ordenadas y salto final: diffs estables entre máquinas.
    return json.dumps(create_app().openapi(), indent=2, sort_keys=True, ensure_ascii=False) + "\n"


def main() -> int:
    content = render()
    if "--check" in sys.argv:
        current = TARGET.read_text(encoding="utf-8") if TARGET.exists() else ""
        if current != content:
            print(f"{TARGET} está desactualizado: ejecuta `make openapi`", file=sys.stderr)
            return 1
        print(f"{TARGET} al día")
        return 0
    TARGET.write_text(content, encoding="utf-8")
    print(f"Escrito {TARGET}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
