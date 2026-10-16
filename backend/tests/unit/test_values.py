from decimal import Decimal

import pytest

from smile.shared.domain import DomainError, Money, Quantity


def test_money_format_es_co() -> None:
    assert Money(cop=1234567).format_es_co() == "$ 1.234.567"


def test_money_rejects_non_integer() -> None:
    with pytest.raises(DomainError):
        Money(cop=10.5)  # type: ignore[arg-type]


def test_quantity_precision() -> None:
    Quantity(amount=Decimal("12.125"), unit="kg")
    with pytest.raises(DomainError):
        Quantity(amount=Decimal("1.0001"), unit="kg")
