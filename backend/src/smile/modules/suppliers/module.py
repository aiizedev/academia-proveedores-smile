"""Composición de `suppliers`: router, cableado de puertos y handlers de eventos."""

from collections.abc import Callable
from typing import Annotated, Any

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from smile.modules.catalog.public import CategoryCodes
from smile.modules.suppliers.api.router import get_my_supplier, router
from smile.modules.suppliers.api.sync_profile import TABLE, SupplierProfileSyncTable
from smile.modules.suppliers.application.commands.update_profile import UpdateSupplierProfile
from smile.modules.suppliers.application.queries.get_my_supplier import GetMySupplier
from smile.modules.suppliers.application.queries.profile_changes import ProfileChangesSince
from smile.modules.suppliers.infrastructure.repositories import SqlSupplierRepository
from smile.modules.sync.public import register_table
from smile.shared.infrastructure.clock import SystemClock
from smile.shared.infrastructure.db import session_scope
from smile.shared.infrastructure.event_bus import InMemoryEventBus
from smile.shared.infrastructure.uow import SavepointUnitOfWork

__all__ = ["dependency_overrides", "register_handlers", "router"]


def _get_my_supplier(
    session: Annotated[AsyncSession, Depends(session_scope)],
) -> GetMySupplier:
    return GetMySupplier(SqlSupplierRepository(session))


def _profile_sync_table(uow: SavepointUnitOfWork) -> SupplierProfileSyncTable:
    repo = SqlSupplierRepository(uow.session)
    return SupplierProfileSyncTable(
        UpdateSupplierProfile(uow, repo, CategoryCodes(uow.session), SystemClock()),
        ProfileChangesSince(repo),
    )


register_table(TABLE, priority=2, factory=_profile_sync_table)

#: Proveedor abstracto (api) → implementación concreta (infrastructure).
dependency_overrides: dict[Callable[..., Any], Callable[..., Any]] = {
    get_my_supplier: _get_my_supplier,
}


def register_handlers(bus: InMemoryEventBus) -> None:
    """Suscribe los handlers de eventos de este módulo (ninguno todavía)."""
