"""Composición de `sync`: router, cableado de puertos y handlers de eventos."""

from collections.abc import AsyncIterator, Callable
from typing import Annotated, Any

from fastapi import Depends

from smile.modules.sync.api.router import get_pull, get_push, router
from smile.modules.sync.application.commands.push import Push
from smile.modules.sync.application.ports.tables import SyncTable
from smile.modules.sync.application.queries.pull import Pull
from smile.modules.sync.application.registry import registered_tables
from smile.modules.sync.infrastructure.store import SqlProcessedMutations, SqlTransaction
from smile.shared.infrastructure.clock import SystemClock
from smile.shared.infrastructure.db import get_sessionmaker
from smile.shared.infrastructure.event_bus import InMemoryEventBus
from smile.shared.infrastructure.uow import SavepointUnitOfWork

__all__ = ["dependency_overrides", "register_handlers", "router"]


async def _uow() -> AsyncIterator[SavepointUnitOfWork]:
    async with get_sessionmaker()() as session:
        yield SavepointUnitOfWork(session)


Uow = Annotated[SavepointUnitOfWork, Depends(_uow)]


def _tables(uow: SavepointUnitOfWork) -> dict[str, SyncTable]:
    return {name: reg.factory(uow) for name, reg in registered_tables().items()}


def _push(uow: Uow) -> Push:
    return Push(_tables(uow), SqlProcessedMutations(uow.session), SqlTransaction(uow.session))


def _pull(uow: Uow) -> Pull:
    return Pull(_tables(uow), SystemClock())


#: Proveedor abstracto (api) → implementación concreta (infrastructure).
dependency_overrides: dict[Callable[..., Any], Callable[..., Any]] = {
    get_push: _push,
    get_pull: _pull,
}


def register_handlers(bus: InMemoryEventBus) -> None:
    """Suscribe los handlers de eventos de este módulo (ninguno todavía)."""
