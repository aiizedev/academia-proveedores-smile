"""Proveedor y su ficha de identificación (RF-SUP-001, HU-SUP-01, SPEC-SOT §1.1 E1)."""

from __future__ import annotations

import re
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from enum import StrEnum
from typing import ClassVar

from smile.modules.suppliers.domain.nit import Nit
from smile.shared.domain.base import AggregateRoot, DomainEvent, ValueObject
from smile.shared.domain.errors import DomainError


class PersonType(StrEnum):
    NATURAL = "natural"
    JURIDICA = "juridica"


class ContactChannel(StrEnum):
    WHATSAPP = "whatsapp"
    LLAMADA = "llamada"
    CORREO = "correo"


class Segment(StrEnum):
    ESTRATEGICO = "ESTRATEGICO"
    LOCAL = "LOCAL"


class InvalidProfileError(DomainError):
    code = "invalid_profile"


@dataclass(frozen=True, kw_only=True)
class SupplierProfileCompleted(DomainEvent):
    """La ficha obligatoria quedó completa: habilita la Etapa 1 del funnel (S-08)."""

    name: ClassVar[str] = "suppliers.SupplierProfileCompleted"
    supplier_id: uuid.UUID


@dataclass(frozen=True, kw_only=True)
class Profile(ValueObject):
    """Ficha de identificación completa y válida. Vereda y coordenadas son opcionales."""

    person_type: PersonType
    tax_id: Nit
    legal_name: str
    department_code: str
    municipality_code: str
    contact_channel: ContactChannel
    main_category: str
    legal_rep: str | None = None
    vereda: str | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    secondary_categories: tuple[str, ...] = field(default_factory=tuple)

    def __post_init__(self) -> None:
        if not self.legal_name.strip():
            raise InvalidProfileError("La razón social o el nombre es obligatorio")
        if self.person_type is PersonType.JURIDICA and not (self.legal_rep or "").strip():
            raise InvalidProfileError(
                "El representante legal es obligatorio para persona jurídica",
                code="legal_rep_required",
            )
        if not re.fullmatch(r"\d{2}", self.department_code) or not re.fullmatch(
            r"\d{5}", self.municipality_code
        ):
            raise InvalidProfileError("Departamento o municipio no válido", code="invalid_divipola")
        if not self.municipality_code.startswith(self.department_code):
            raise InvalidProfileError(
                "El municipio no pertenece al departamento", code="invalid_divipola"
            )
        if self.main_category in self.secondary_categories:
            raise InvalidProfileError("La categoría principal no puede repetirse como secundaria")
        for coord, limit in ((self.latitude, 90), (self.longitude, 180)):
            if coord is not None and not -limit <= coord <= limit:
                raise InvalidProfileError("Coordenadas no válidas", code="invalid_coordinates")


class Supplier(AggregateRoot):
    """Un proveedor por cuenta PROVEEDOR (`owner_user_id`). Nace sin ficha."""

    def __init__(
        self,
        *,
        id: uuid.UUID | None = None,
        owner_user_id: uuid.UUID,
        profile: Profile | None = None,
        segment: Segment = Segment.LOCAL,
        profile_completed_at: datetime | None = None,
    ) -> None:
        super().__init__(id)
        self.owner_user_id = owner_user_id
        self.profile = profile
        self.segment = segment
        self.profile_completed_at = profile_completed_at

    @property
    def is_profile_complete(self) -> bool:
        return self.profile_completed_at is not None

    def update_profile(self, profile: Profile, now: datetime) -> None:
        """La primera vez que la ficha queda completa emite `SupplierProfileCompleted`."""
        self.profile = profile
        if self.profile_completed_at is None:
            self.profile_completed_at = now
            self.record(SupplierProfileCompleted(supplier_id=self.id, occurred_at=now))
