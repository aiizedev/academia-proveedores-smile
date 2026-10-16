"""Entidad, agregado, value object y evento de dominio."""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any, ClassVar


@dataclass(frozen=True, kw_only=True)
class ValueObject:
    """Inmutable; igualdad por valor."""


@dataclass(frozen=True, kw_only=True)
class DomainEvent:
    """Hecho del dominio. Se persiste en `shared.outbox` (ADR-0007).

    `name` identifica el tipo de evento; el payload es el resto de campos.
    """

    name: ClassVar[str] = "domain_event"
    event_id: uuid.UUID = field(default_factory=uuid.uuid4)
    occurred_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    def payload(self) -> dict[str, Any]:
        data = {k: v for k, v in self.__dict__.items() if k not in {"event_id", "occurred_at"}}
        return {k: (str(v) if isinstance(v, uuid.UUID) else v) for k, v in data.items()}


class Entity:
    """Identidad por `id` (UUID generado en el cliente o en el servidor)."""

    def __init__(self, id: uuid.UUID | None = None) -> None:
        self.id: uuid.UUID = id or uuid.uuid4()

    def __eq__(self, other: object) -> bool:
        return isinstance(other, type(self)) and other.id == self.id

    def __hash__(self) -> int:
        return hash(self.id)


class AggregateRoot(Entity):
    """Raíz de agregado: acumula eventos que la UnitOfWork vuelca al outbox."""

    def __init__(self, id: uuid.UUID | None = None) -> None:
        super().__init__(id)
        self._events: list[DomainEvent] = []

    def record(self, event: DomainEvent) -> None:
        self._events.append(event)

    def pull_events(self) -> list[DomainEvent]:
        events, self._events = self._events, []
        return events
