"""DTOs HTTP de `assessment` (Pydantic)."""

from typing import Literal

from pydantic import BaseModel, Field

AnswerCode = Literal["si", "aveces", "no", "na", "pnr"]


class AnswerIn(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    axis: str = Field(min_length=1, max_length=32)
    weight: int = Field(ge=1, le=5)
    answer: AnswerCode
    critical_when: list[AnswerCode] = Field(default_factory=list)


class ScorePreviewIn(BaseModel):
    category: str = "fruver"
    answers: list[AnswerIn] = Field(min_length=1, max_length=25)


class AxisOut(BaseModel):
    """Puntajes como número JSON con 2 decimales (ya redondeados half-up en el dominio)."""

    score: float | None
    level: str | None
    urgent: bool


class PlanItemOut(BaseModel):
    axis: str
    priority: str


class ScorePreviewOut(BaseModel):
    axes: dict[str, AxisOut]
    pillar1: float | None
    plan: list[PlanItemOut]
