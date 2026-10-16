"""Modelos ORM del esquema `suppliers` (esquema-datos §3.4)."""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, Index, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column

from smile.shared.infrastructure.db import Base


class SupplierModel(Base):
    """Las columnas de la ficha son nulas hasta que el proveedor la completa."""

    __tablename__ = "suppliers"
    __table_args__ = (
        CheckConstraint("person_type IN ('natural','juridica')", name="person_type_valid"),
        CheckConstraint(
            "contact_channel IN ('whatsapp','llamada','correo')", name="contact_channel_valid"
        ),
        CheckConstraint("segment IN ('ESTRATEGICO','LOCAL')", name="segment_valid"),
        CheckConstraint(
            "profile_completed_at IS NULL OR (tax_id IS NOT NULL AND legal_name IS NOT NULL"
            " AND municipality_code IS NOT NULL AND main_category IS NOT NULL)",
            name="complete_profile_has_fields",
        ),
        Index("ix_suppliers_main_category", "main_category"),
        Index("ix_suppliers_segment", "segment"),
        Index("ix_suppliers_municipality_code", "municipality_code"),
        {"schema": "suppliers"},
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    owner_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True)
    person_type: Mapped[str | None] = mapped_column(Text)
    tax_id: Mapped[str | None] = mapped_column(String(15), unique=True)
    tax_dv: Mapped[str | None] = mapped_column(String(1))
    legal_name: Mapped[str | None] = mapped_column(Text)
    legal_rep: Mapped[str | None] = mapped_column(Text)
    department_code: Mapped[str | None] = mapped_column(String(2))
    municipality_code: Mapped[str | None] = mapped_column(String(5))
    vereda: Mapped[str | None] = mapped_column(Text)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    contact_channel: Mapped[str | None] = mapped_column(Text)
    main_category: Mapped[str | None] = mapped_column(Text)
    secondary_categories: Mapped[list[str]] = mapped_column(ARRAY(Text), server_default="{}")
    segment: Mapped[str] = mapped_column(Text, server_default="LOCAL")
    profile_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
