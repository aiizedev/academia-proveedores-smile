"""Modelo ORM de `sync.processed_mutations` (creada en la migración 0001)."""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import CheckConstraint, DateTime, Index, SmallInteger, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from smile.shared.infrastructure.db import Base


class ProcessedMutationModel(Base):
    __tablename__ = "processed_mutations"
    __table_args__ = (
        CheckConstraint("priority IN (1, 2, 3)", name="priority_valid"),
        Index("ix_processed_mutations_user", "user_id", "processed_at"),
        {"schema": "sync"},
    )

    mutation_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
    priority: Mapped[int] = mapped_column(SmallInteger)
    processed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    result: Mapped[dict[str, Any]] = mapped_column(JSONB)
