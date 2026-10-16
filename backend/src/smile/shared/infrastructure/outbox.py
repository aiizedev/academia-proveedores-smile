"""Outbox transaccional (ADR-0007): eventos guardados junto al cambio de estado."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, Index, Integer, String, Text, func, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from smile.shared.domain.base import DomainEvent
from smile.shared.infrastructure.db import Base


class OutboxMessage(Base):
    __tablename__ = "outbox"
    __table_args__ = (
        Index("ix_outbox_event_name", "event_name"),
        Index(
            "ix_outbox_pending",
            "created_at",
            postgresql_where=text("processed_at IS NULL AND NOT dead"),
        ),
        {"schema": "shared"},
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    event_name: Mapped[str] = mapped_column(String(120))
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    dead: Mapped[bool] = mapped_column(default=False, server_default="false")

    @classmethod
    def from_event(cls, event: DomainEvent) -> OutboxMessage:
        return cls(
            id=event.event_id,
            event_name=event.name,
            payload=event.payload(),
            occurred_at=event.occurred_at,
        )
