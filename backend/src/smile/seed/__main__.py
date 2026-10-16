"""`python -m smile.seed`: carga los datos de demostración (MODO_POC §3.1).

Solo actúa si `SEED_DEMO=true` (o con `--force`); siempre termina con código 0 si
no hay error. Llama `seed_demo(session)` de cada módulo que lo tenga, en el orden
de `MODULE_NAMES` (respeta dependencias), todo en una transacción.
"""

import asyncio
import importlib
import importlib.util
import os
import sys

import structlog

from smile.config import get_settings
from smile.modules import MODULE_NAMES
from smile.observability import configure_logging
from smile.shared.infrastructure.db import get_engine, get_sessionmaker

log = structlog.get_logger("smile.seed")


async def run() -> list[str]:
    seeded: list[str] = []
    async with get_sessionmaker()() as session, session.begin():
        for name in MODULE_NAMES:
            path = f"smile.modules.{name}.infrastructure.seed"
            if importlib.util.find_spec(path) is None:
                continue
            await importlib.import_module(path).seed_demo(session)
            seeded.append(name)
    await get_engine().dispose()
    return seeded


def main() -> int:
    configure_logging(get_settings().log_level)
    if os.environ.get("SEED_DEMO", "").lower() != "true" and "--force" not in sys.argv:
        log.info("seed.skipped", reason="SEED_DEMO != true")
        return 0
    seeded = asyncio.run(run())
    log.info("seed.done", modules=seeded)
    return 0


if __name__ == "__main__":
    sys.exit(main())
