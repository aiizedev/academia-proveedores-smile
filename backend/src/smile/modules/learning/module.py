"""Composición de `learning`: router, cableado de puertos y handlers de eventos."""

from collections.abc import Callable
from typing import Any

from smile.modules.learning.api.router import router
from smile.shared.infrastructure.event_bus import InMemoryEventBus

__all__ = ["dependency_overrides", "register_handlers", "router"]

#: Proveedor abstracto (api) → implementación concreta (infrastructure).
dependency_overrides: dict[Callable[..., Any], Callable[..., Any]] = {}


def register_handlers(bus: InMemoryEventBus) -> None:
    """Suscribe los handlers de eventos de este módulo (ninguno todavía)."""
