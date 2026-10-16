"""DTOs HTTP de `catalog` (Pydantic)."""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel


class AxisOut(BaseModel):
    code: str
    name: str
    short_name: str
    icon: str


class CategoryOut(BaseModel):
    code: str
    name: str
    status: Literal["ACTIVA", "PROXIMAMENTE"]
    icon: str
    axes: list[AxisOut]


class ParameterSetOut(BaseModel):
    version: int
    valid_from: datetime
    value: dict[str, Any]


class CatalogBundleOut(BaseModel):
    categories: list[CategoryOut]
    parameters: dict[str, ParameterSetOut]
