"""Composición de `assessment`: router, cableado de puertos y handlers de eventos."""

from collections.abc import Callable
from typing import Any

from smile.modules.assessment.api.router import get_score_assessment, router
from smile.modules.assessment.application.queries.score_assessment import ScoreAssessment
from smile.modules.assessment.infrastructure.default_rules import DefaultScoringRulesProvider
from smile.shared.infrastructure.event_bus import InMemoryEventBus

__all__ = ["dependency_overrides", "register_handlers", "router"]


def _score_assessment() -> ScoreAssessment:
    return ScoreAssessment(DefaultScoringRulesProvider())


#: Proveedor abstracto (api) → implementación concreta (infrastructure).
dependency_overrides: dict[Callable[..., Any], Callable[..., Any]] = {
    get_score_assessment: _score_assessment,
}


def register_handlers(bus: InMemoryEventBus) -> None:
    """Suscribe los handlers de eventos de este módulo (ninguno todavía)."""
