"""Catálogo de categorías, ejes y parámetros (RF-CAT-001, RF-CAT-002, RF-CAT-004)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import StrEnum
from typing import Any

from smile.shared.domain.base import ValueObject


class CategoryStatus(StrEnum):
    ACTIVA = "ACTIVA"
    PROXIMAMENTE = "PROXIMAMENTE"


@dataclass(frozen=True, kw_only=True)
class Axis(ValueObject):
    code: str
    name: str
    short_name: str
    icon: str
    position: int


@dataclass(frozen=True, kw_only=True)
class Category(ValueObject):
    """Solo una categoría ACTIVA compone autoevaluación (C-08: en el piloto, Fruver)."""

    code: str
    name: str
    status: CategoryStatus
    icon: str
    axes: tuple[Axis, ...] = field(default_factory=tuple)

    @property
    def is_active(self) -> bool:
        return self.status is CategoryStatus.ACTIVA

    def ordered_axes(self) -> tuple[Axis, ...]:
        return tuple(sorted(self.axes, key=lambda a: a.position))


@dataclass(frozen=True, kw_only=True)
class ParameterSet(ValueObject):
    """Versión publicada e inmutable de un grupo de parámetros (S-xx)."""

    key: str
    version: int
    value: dict[str, Any]
    valid_from: datetime


def current_parameters(sets: list[ParameterSet], at: datetime) -> dict[str, ParameterSet]:
    """Por cada clave, la versión vigente en `at` (mayor `valid_from` ≤ `at`)."""
    current: dict[str, ParameterSet] = {}
    for p in sorted(sets, key=lambda s: (s.valid_from, s.version)):
        if p.valid_from <= at:
            current[p.key] = p
    return current
