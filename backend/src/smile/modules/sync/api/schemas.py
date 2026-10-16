"""DTOs HTTP de `sync` (contrato de WatermelonDB, arquitectura §5)."""

import uuid
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class TableChangesIn(BaseModel):
    created: list[dict[str, Any]] = Field(default_factory=list, max_length=500)
    updated: list[dict[str, Any]] = Field(default_factory=list, max_length=500)
    deleted: list[str] = Field(default_factory=list, max_length=500)


class PushIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mutation_id: uuid.UUID
    priority: Literal["P1", "P2", "P3"]
    last_pulled_at: int | None = None
    changes: dict[str, TableChangesIn]


class RejectedOut(BaseModel):
    id: str
    table: str
    code: str
    message: str


class PushOut(BaseModel):
    accepted: list[str]
    rejected: list[RejectedOut]


class PullOut(BaseModel):
    changes: dict[str, dict[str, list[Any]]]
    timestamp: int
