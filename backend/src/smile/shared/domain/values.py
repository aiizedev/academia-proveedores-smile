"""Value objects transversales (RNF-DATA-001, RNF-I18N-001)."""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Literal

from smile.shared.domain.base import ValueObject
from smile.shared.domain.errors import DomainError

Unit = Literal["kg", "bulto", "arroba", "litro", "unidad"]


@dataclass(frozen=True, kw_only=True)
class Money(ValueObject):
    """Monto en pesos colombianos, siempre entero (BIGINT)."""

    cop: int

    def __post_init__(self) -> None:
        if not isinstance(self.cop, int) or isinstance(self.cop, bool):
            raise DomainError("El valor en COP debe ser un entero", code="money_not_integer")

    def __add__(self, other: Money) -> Money:
        return Money(cop=self.cop + other.cop)

    def __sub__(self, other: Money) -> Money:
        return Money(cop=self.cop - other.cop)

    def format_es_co(self) -> str:
        """`$ 1.234.567`."""
        sign = "-" if self.cop < 0 else ""
        return f"{sign}$ {abs(self.cop):,}".replace(",", ".")


@dataclass(frozen=True, kw_only=True)
class Quantity(ValueObject):
    """Cantidad con unidad original; NUMERIC(12,3)."""

    amount: Decimal
    unit: Unit

    def __post_init__(self) -> None:
        if self.amount < 0:
            raise DomainError("La cantidad no puede ser negativa", code="negative_quantity")
        if self.amount != self.amount.quantize(Decimal("0.001")):
            raise DomainError("Máximo 3 decimales", code="quantity_precision")
