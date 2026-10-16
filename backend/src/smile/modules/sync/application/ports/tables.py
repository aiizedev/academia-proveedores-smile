"""Contrato entre `sync` y los módulos dueños de cada tabla (arquitectura §5)."""

from __future__ import annotations

import uuid
from collections.abc import Callable
from contextlib import AbstractAsyncContextManager
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Protocol

from smile.shared.application.ports import CurrentUser

Record = dict[str, Any]


@dataclass(frozen=True, kw_only=True)
class TableChanges:
    created: list[Record] = field(default_factory=list)
    updated: list[Record] = field(default_factory=list)
    deleted: list[str] = field(default_factory=list)

    @property
    def is_empty(self) -> bool:
        return not (self.created or self.updated or self.deleted)


class SyncTable(Protocol):
    """Lo implementa el módulo dueño (adaptador entrante en su capa `api`).

    `upsert`/`delete` lanzan `DomainError` para rechazar el registro; `sync` lo
    reporta en `rejected` sin afectar los demás registros del lote (RF-SYN-008).
    """

    async def upsert(self, user: CurrentUser, record: Record) -> None: ...

    async def delete(self, user: CurrentUser, record_id: str) -> None: ...

    async def changes_since(self, user: CurrentUser, since: datetime | None) -> TableChanges: ...


#: Construye el manejador de una tabla con la unidad de trabajo de la petición.
TableFactory = Callable[[Any], SyncTable]


class Transaction(Protocol):
    def savepoint(self) -> AbstractAsyncContextManager[object]: ...

    async def commit(self) -> None: ...


@dataclass(frozen=True, kw_only=True)
class StoredResult:
    user_id: uuid.UUID
    result: dict[str, Any]


class ProcessedMutations(Protocol):
    async def get(self, mutation_id: uuid.UUID) -> StoredResult | None: ...

    async def save(
        self, mutation_id: uuid.UUID, user_id: uuid.UUID, priority: int, result: dict[str, Any]
    ) -> None: ...
