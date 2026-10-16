"""Puertos (Protocol) que implementan los adaptadores de `shared.infrastructure`."""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from types import TracebackType
from typing import Protocol, Self

from smile.shared.domain.base import AggregateRoot, DomainEvent
from smile.shared.domain.errors import NotFoundError


class Role(StrEnum):
    PROVEEDOR = "PROVEEDOR"
    REVIEWER = "REVIEWER"
    ADMIN = "ADMIN"


@dataclass(frozen=True, kw_only=True)
class CurrentUser:
    """Usuario autenticado (RF-IAM-004). Lo resuelve `iam` a partir del JWT."""

    id: uuid.UUID
    role: Role
    supplier_id: uuid.UUID | None = None

    @property
    def is_internal(self) -> bool:
        return self.role in (Role.REVIEWER, Role.ADMIN)

    def ensure_supplier_access(self, supplier_id: uuid.UUID) -> None:
        """RNF-SEC-004: un proveedor solo ve lo suyo. Lo ajeno responde 404, no 403,
        para no revelar que existe. Los roles internos pasan (su permiso lo controla
        `require`)."""
        if self.role is Role.PROVEEDOR and self.supplier_id != supplier_id:
            raise NotFoundError("Recurso no encontrado")


class Clock(Protocol):
    def now(self) -> datetime: ...


class UnitOfWork(Protocol):
    """Transacción de un caso de uso. Al confirmar vuelca los eventos de los
    agregados registrados al outbox en la misma transacción (ADR-0007)."""

    async def __aenter__(self) -> Self: ...

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None: ...

    def track(self, aggregate: AggregateRoot) -> None: ...

    async def commit(self) -> None: ...

    async def rollback(self) -> None: ...


class EventBus(Protocol):
    """Despacho in-process de eventos (usado por el worker al leer el outbox)."""

    async def publish(self, event_name: str, payload: dict[str, object]) -> None: ...


class EventPublisher(Protocol):
    def add(self, event: DomainEvent) -> None: ...


@dataclass(frozen=True, kw_only=True)
class PresignedUpload:
    url: str
    fields: dict[str, str]
    key: str
    expires_in: int


class FileStorage(Protocol):
    """Almacenamiento de objetos (ADR-0004). S3 (SeaweedFS) en dev, GCS en producción."""

    def presign_put(
        self, key: str, *, content_type: str, max_bytes: int, expires_in: int = 900
    ) -> PresignedUpload: ...

    def presign_get(self, key: str, *, expires_in: int = 900) -> str: ...

    def head(self, key: str) -> dict[str, object] | None: ...

    def delete(self, key: str) -> None: ...

    def ping(self) -> bool: ...
