"""Reglas puras de puntaje del diagnóstico (RF-ASM-005…008, RF-IMP-001).

Supuestos S-01, S-02, S-03, S-09 (docs/sistema/conflictos-y-supuestos.md). Validado contra
`contracts/fixtures/assessment-scoring.json`, el mismo fixture que usa el espejo TypeScript
del frontend (ADR-0005).

Redondeo: puntajes a 2 decimales *half-up*. El nivel se decide con el valor exacto; el
Pilar 1 promedia los puntajes por eje ya redondeados; el plan desempata con el puntaje
redondeado.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal
from enum import StrEnum

from smile.shared.domain.errors import DomainError

TWO_PLACES = Decimal("0.01")


class Answer(StrEnum):
    SI = "si"
    AVECES = "aveces"
    NO = "no"
    NO_APLICA = "na"
    PREFIERO_NO_RESPONDER = "pnr"


class Level(StrEnum):
    INICIAL = "inicial"
    DESARROLLO = "desarrollo"
    AVANZADO = "avanzado"


class Priority(StrEnum):
    URGENTE = "urgente"
    ALTA = "alta"
    MEDIA = "media"
    MANTENER = "mantener"


@dataclass(frozen=True, kw_only=True)
class ScoringRules:
    """Parámetros versionados (RF-CAT-004). Valores por defecto: S-01 y S-03."""

    answer_values: Mapping[Answer, Decimal]
    excluded_answers: frozenset[Answer]
    level_thresholds: Sequence[tuple[Level, Decimal]]  # ascendente por mínimo
    priority_by_level: Mapping[Level, Priority]
    axes_order: Sequence[str]
    plan_size: int = 3

    def level_for(self, score: Decimal) -> Level:
        level = self.level_thresholds[0][0]
        for candidate, minimum in self.level_thresholds:
            if score >= minimum:
                level = candidate
        return level


@dataclass(frozen=True, kw_only=True)
class AnsweredQuestion:
    id: str
    axis: str
    weight: int
    answer: Answer
    critical_when: frozenset[Answer] = field(default_factory=frozenset)

    def __post_init__(self) -> None:
        if not 1 <= self.weight <= 5:
            raise DomainError("El peso de una pregunta va de 1 a 5", code="invalid_weight")


@dataclass(frozen=True, kw_only=True)
class AxisResult:
    axis: str
    score: Decimal | None
    level: Level | None
    urgent: bool


@dataclass(frozen=True, kw_only=True)
class PlanItem:
    axis: str
    priority: Priority


@dataclass(frozen=True, kw_only=True)
class AssessmentScore:
    axes: Mapping[str, AxisResult]
    pillar1: Decimal | None
    plan: Sequence[PlanItem]


def _round(value: Decimal) -> Decimal:
    return value.quantize(TWO_PLACES, rounding=ROUND_HALF_UP)


def score_axis(axis: str, questions: Sequence[AnsweredQuestion], rules: ScoringRules) -> AxisResult:
    applicable = [q for q in questions if q.answer not in rules.excluded_answers]
    if not applicable:
        return AxisResult(axis=axis, score=None, level=None, urgent=False)
    points = sum((q.weight * rules.answer_values[q.answer] for q in applicable), Decimal(0))
    weights = sum(q.weight for q in applicable)
    exact = points / Decimal(weights) * 100
    urgent = any(q.answer in q.critical_when for q in applicable)
    level = rules.level_for(exact)
    if urgent and level is Level.AVANZADO:
        level = Level.DESARROLLO
    return AxisResult(axis=axis, score=_round(exact), level=level, urgent=urgent)


def build_plan(axes: Mapping[str, AxisResult], rules: ScoringRules) -> list[PlanItem]:
    order = {axis: i for i, axis in enumerate(rules.axes_order)}
    scored = [r for r in axes.values() if r.score is not None and r.level is not None]
    gap_rank = {Level.INICIAL: 1, Level.DESARROLLO: 2}

    def is_gap(r: AxisResult) -> bool:
        return r.urgent or r.level is not Level.AVANZADO

    gaps = sorted(
        (r for r in scored if is_gap(r)),
        key=lambda r: (0 if r.urgent else gap_rank[r.level], r.score, order[r.axis]),  # type: ignore[index]
    )
    plan = [
        PlanItem(
            axis=r.axis,
            priority=Priority.URGENTE if r.urgent else rules.priority_by_level[r.level],  # type: ignore[index]
        )
        for r in gaps[: rules.plan_size]
    ]
    if len(plan) < rules.plan_size:
        rest = sorted((r for r in scored if not is_gap(r)), key=lambda r: (r.score, order[r.axis]))
        plan += [
            PlanItem(axis=r.axis, priority=Priority.MANTENER)
            for r in rest[: rules.plan_size - len(plan)]
        ]
    return plan


def score_assessment(questions: Sequence[AnsweredQuestion], rules: ScoringRules) -> AssessmentScore:
    unknown = {q.axis for q in questions} - set(rules.axes_order)
    if unknown:
        raise DomainError(f"Ejes desconocidos: {sorted(unknown)}", code="unknown_axis")
    axes = {
        axis: score_axis(axis, [q for q in questions if q.axis == axis], rules)
        for axis in rules.axes_order
    }
    scores = [r.score for r in axes.values() if r.score is not None]
    pillar1 = _round(sum(scores, Decimal(0)) / len(scores)) if scores else None
    return AssessmentScore(axes=axes, pillar1=pillar1, plan=build_plan(axes, rules))
