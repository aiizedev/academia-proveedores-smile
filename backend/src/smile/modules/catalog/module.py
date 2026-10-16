"""Composición de `catalog`: router, cableado de puertos y handlers de eventos."""

from collections.abc import Callable
from typing import Annotated, Any

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from smile.modules.catalog.api.router import get_catalog_bundle, router
from smile.modules.catalog.application.queries.get_catalog_bundle import GetCatalogBundle
from smile.modules.catalog.infrastructure.reader import SqlCatalogReader
from smile.shared.infrastructure.clock import SystemClock
from smile.shared.infrastructure.db import session_scope
from smile.shared.infrastructure.event_bus import InMemoryEventBus

__all__ = ["dependency_overrides", "register_handlers", "router"]


def _catalog_bundle(
    session: Annotated[AsyncSession, Depends(session_scope)],
) -> GetCatalogBundle:
    return GetCatalogBundle(SqlCatalogReader(session), SystemClock())


#: Proveedor abstracto (api) → implementación concreta (infrastructure).
dependency_overrides: dict[Callable[..., Any], Callable[..., Any]] = {
    get_catalog_bundle: _catalog_bundle,
}


def register_handlers(bus: InMemoryEventBus) -> None:
    """Suscribe los handlers de eventos de este módulo (ninguno todavía)."""
