"""Modelos ORM del esquema `catalog` (esquema-datos §3.5)."""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from smile.shared.infrastructure.db import Base


class CategoryModel(Base):
    __tablename__ = "categories"
    __table_args__ = (
        CheckConstraint("status IN ('ACTIVA','PROXIMAMENTE')", name="status_valid"),
        {"schema": "catalog"},
    )

    code: Mapped[str] = mapped_column(Text, primary_key=True)
    name: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text)
    icon: Mapped[str] = mapped_column(Text)
    position: Mapped[int] = mapped_column(SmallInteger)


class AxisModel(Base):
    __tablename__ = "axes"
    __table_args__ = (
        UniqueConstraint("category_code", "code", name="uq_axes_category_code"),
        {"schema": "catalog"},
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    category_code: Mapped[str] = mapped_column(ForeignKey("catalog.categories.code"))
    code: Mapped[str] = mapped_column(Text)
    name: Mapped[str] = mapped_column(Text)
    short_name: Mapped[str] = mapped_column(Text)
    icon: Mapped[str] = mapped_column(Text)
    position: Mapped[int] = mapped_column(SmallInteger)


class ParameterSetModel(Base):
    __tablename__ = "parameter_sets"
    __table_args__ = (
        UniqueConstraint("key", "version", name="uq_parameter_sets_key_version"),
        Index("ix_parameter_sets_key_valid_from", "key", text("valid_from DESC")),
        {"schema": "catalog"},
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    key: Mapped[str] = mapped_column(Text)
    version: Mapped[int] = mapped_column(Integer)
    value: Mapped[dict[str, Any]] = mapped_column(JSONB)
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    published_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    published_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
