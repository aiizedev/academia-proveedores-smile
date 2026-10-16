"""Composición de `suppliers`: router, cableado de puertos y handlers de eventos."""

from collections.abc import Callable
from typing import Annotated, Any

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from smile.modules.suppliers.api.router import get_my_supplier, router
from smile.modules.suppliers.application.queries.get_my_supplier import GetMySupplier
from smile.modules.suppliers.infrastructure.repositories import SqlSupplierRepository
from smile.shared.infrastructure.db import session_scope
from smile.shared.infrastructure.event_bus import InMemoryEventBus

__all__ = ["dependency_overrides", "register_handlers", "router"]


def _get_my_supplier(
    session: Annotated[AsyncSession, Depends(session_scope)],
) -> GetMySupplier:
    return GetMySupplier(SqlSupplierRepository(session))


#: Proveedor abstracto (api) → implementación concreta (infrastructure).
dependency_overrides: dict[Callable[..., Any], Callable[..., Any]] = {
    get_my_supplier: _get_my_supplier,
}


def register_handlers(bus: InMemoryEventBus) -> None:
    """Suscribe los handlers de eventos de este módulo (ninguno todavía)."""
