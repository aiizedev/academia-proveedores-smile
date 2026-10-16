"""Paquete de catálogo para la PWA (pull) y el back-office (HU-CAT-01)."""

from __future__ import annotations

from dataclasses import dataclass

from smile.modules.catalog.application.ports.catalog import CatalogReader
from smile.modules.catalog.domain.catalog import Category, ParameterSet, current_parameters
from smile.shared.application.ports import Clock


@dataclass(frozen=True, kw_only=True)
class CatalogBundle:
    categories: list[Category]
    parameters: dict[str, ParameterSet]


class GetCatalogBundle:
    def __init__(self, reader: CatalogReader, clock: Clock) -> None:
        self._reader = reader
        self._clock = clock

    async def __call__(self) -> CatalogBundle:
        categories = await self._reader.categories()
        sets = await self._reader.parameter_sets()
        return CatalogBundle(
            categories=categories, parameters=current_parameters(sets, self._clock.now())
        )
