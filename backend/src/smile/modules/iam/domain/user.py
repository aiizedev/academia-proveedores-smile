"""Usuario del sistema (RF-IAM-001, RF-IAM-005, RF-IAM-006; esquema-datos §3.2)."""

from __future__ import annotations

import re
import uuid

from smile.shared.application.ports import Role
from smile.shared.domain.base import AggregateRoot
from smile.shared.domain.errors import DomainError

_PHONE = re.compile(r"^3\d{9}$")
_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class InvalidUserError(DomainError):
    code = "invalid_user"


def normalize_phone(raw: str) -> str:
    """Celular colombiano de 10 dígitos que inicia en 3; acepta `+57`, espacios y guiones."""
    digits = re.sub(r"\D", "", raw)
    if len(digits) == 12 and digits.startswith("57"):
        digits = digits[2:]
    if not _PHONE.match(digits):
        raise InvalidUserError(
            "El celular debe tener 10 dígitos e iniciar en 3", code="invalid_phone"
        )
    return digits


def normalize_email(raw: str) -> str:
    email = raw.strip().lower()
    if not _EMAIL.match(email):
        raise InvalidUserError("El correo no es válido", code="invalid_email")
    return email


class User(AggregateRoot):
    """Cuenta de acceso. Invariante: tiene celular o correo (al menos uno)."""

    def __init__(
        self,
        *,
        id: uuid.UUID | None = None,
        full_name: str,
        role: Role,
        password_hash: str,
        phone: str | None = None,
        email: str | None = None,
        is_active: bool = True,
    ) -> None:
        super().__init__(id)
        if not full_name.strip():
            raise InvalidUserError("El nombre es obligatorio", code="name_required")
        if phone is None and email is None:
            raise InvalidUserError("Se requiere celular o correo", code="contact_required")
        self.full_name = full_name.strip()
        self.role = role
        self.password_hash = password_hash
        self.phone = normalize_phone(phone) if phone is not None else None
        self.email = normalize_email(email) if email is not None else None
        self.is_active = is_active
