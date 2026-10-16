"""NIT / cédula con dígito de verificación módulo 11 DIAN (RF-SUP-001)."""

from __future__ import annotations

import re
from dataclasses import dataclass

from smile.shared.domain.base import ValueObject
from smile.shared.domain.errors import DomainError

_WEIGHTS = (3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71)


class InvalidNitError(DomainError):
    code = "invalid_nit"


def check_digit(number: str) -> str:
    """DV DIAN: pesos primos desde el dígito de la derecha; r = Σ mod 11; DV = r si r < 2."""
    total = sum(int(d) * w for d, w in zip(reversed(number), _WEIGHTS, strict=False))
    r = total % 11
    return str(r if r < 2 else 11 - r)


@dataclass(frozen=True, kw_only=True)
class Nit(ValueObject):
    number: str
    dv: str

    @classmethod
    def parse(cls, number: str, dv: str) -> Nit:
        digits = re.sub(r"[.\s-]", "", number)
        if not re.fullmatch(r"\d{5,15}", digits):
            raise InvalidNitError("El NIT o cédula debe tener entre 5 y 15 dígitos")
        if dv.strip() != check_digit(digits):
            raise InvalidNitError(
                "El dígito de verificación no coincide", code="nit_check_digit_mismatch"
            )
        return cls(number=digits, dv=dv.strip())
