"""Worker: despacha el outbox y ejecuta tareas programadas (ADR-0007).

Uso: `python -m smile.worker`.
"""

from __future__ import annotations

import asyncio
import contextlib
import importlib
import signal
from pathlib import Path

import structlog
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select
from sqlalchemy.sql import func

from smile.config import get_settings
from smile.modules import MODULE_NAMES
from smile.observability import configure_logging
from smile.shared.infrastructure.db import get_engine, get_sessionmaker
from smile.shared.infrastructure.event_bus import event_bus
from smile.shared.infrastructure.outbox import OutboxMessage

log = structlog.get_logger("worker")

# El healthcheck del contenedor verifica que este archivo se haya tocado hace poco.
# Solo se actualiza tras un sondeo exitoso del outbox, así refleja que la DB responde.
HEARTBEAT_FILE = Path("/tmp/smile-worker-heartbeat")


async def dispatch_batch(batch_size: int, max_attempts: int) -> int:
    """Procesa hasta `batch_size` eventos pendientes. Devuelve cuántos tomó."""
    async with get_sessionmaker()() as session, session.begin():
        rows = (
            await session.scalars(
                select(OutboxMessage)
                .where(OutboxMessage.processed_at.is_(None), OutboxMessage.dead.is_(False))
                .order_by(OutboxMessage.created_at)
                .limit(batch_size)
                .with_for_update(skip_locked=True)
            )
        ).all()
        for msg in rows:
            try:
                await event_bus.publish(msg.event_name, msg.payload)
                msg.processed_at = func.now()
            except Exception as exc:  # handler idempotente: se reintenta
                msg.attempts += 1
                msg.last_error = repr(exc)[:2000]
                msg.dead = msg.attempts >= max_attempts
                log.warning("outbox_handler_failed", event=msg.event_name, attempts=msg.attempts)
        return len(rows)


async def run() -> None:
    settings = get_settings()
    configure_logging(settings.log_level)
    for name in MODULE_NAMES:
        importlib.import_module(f"smile.modules.{name}.module").register_handlers(event_bus)

    scheduler = AsyncIOScheduler(timezone=settings.tz)
    # Tareas programadas (se registran por módulo en releases posteriores):
    # cierre de ciclo (scoring), score provisional diario, vencimientos (suppliers).
    scheduler.start()

    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, stop.set)

    log.info("worker_started")
    while not stop.is_set():
        try:
            taken = await dispatch_batch(settings.outbox_batch_size, settings.outbox_max_attempts)
            await asyncio.to_thread(HEARTBEAT_FILE.touch)
        except Exception:
            log.exception("outbox_poll_failed")
            taken = 0
        if taken == 0:
            with contextlib.suppress(TimeoutError):
                await asyncio.wait_for(stop.wait(), timeout=settings.outbox_poll_seconds)
    scheduler.shutdown(wait=False)
    await get_engine().dispose()
    log.info("worker_stopped")


__all__ = ["HEARTBEAT_FILE", "dispatch_batch", "run"]

if __name__ == "__main__":
    asyncio.run(run())
