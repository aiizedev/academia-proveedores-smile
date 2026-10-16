"""Utilidades de los datos de demostración (MODO_POC §3.1).

Cada módulo define `seed_demo(session)` en `infrastructure/seed.py`; el runner
`python -m smile.seed` las llama en el orden de `MODULE_NAMES`.
IDs fijos (`demo_id`) + upsert ⇒ idempotente; `demo_random` ⇒ determinista.
"""

import random
import uuid

DEMO_NAMESPACE = uuid.UUID("5e3d1c7a-0b5f-4c1e-9a52-5311e0000000")
DEMO_PASSWORD = "Smile2026!"  # solo demo; documentada en el README


def demo_id(key: str) -> uuid.UUID:
    """UUID estable para una entidad de demo: `demo_id("iam.user:admin")`."""
    return uuid.uuid5(DEMO_NAMESPACE, key)


def demo_random(scope: str) -> random.Random:
    """Generador determinista por módulo (semilla 42 + ámbito)."""
    return random.Random(f"42:{scope}")
