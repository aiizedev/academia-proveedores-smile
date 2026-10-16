"""Reglas por defecto (S-01, S-03, ejes Fruver de DOC-FRUVER §2).

Adaptador provisional hasta que `catalog` publique parámetros versionados (RF-CAT-004).
"""

from decimal import Decimal

from smile.modules.assessment.domain.scoring import Answer, Level, Priority, ScoringRules
from smile.shared.domain.errors import NotFoundError

FRUVER_AXES = ("bpa", "residuos", "carbono", "infantil", "ddhh")

DEFAULT_RULES = ScoringRules(
    answer_values={Answer.SI: Decimal(1), Answer.AVECES: Decimal("0.5"), Answer.NO: Decimal(0)},
    excluded_answers=frozenset({Answer.NO_APLICA, Answer.PREFIERO_NO_RESPONDER}),
    level_thresholds=(
        (Level.INICIAL, Decimal(0)),
        (Level.DESARROLLO, Decimal(40)),
        (Level.AVANZADO, Decimal(75)),
    ),
    priority_by_level={
        Level.INICIAL: Priority.ALTA,
        Level.DESARROLLO: Priority.MEDIA,
        Level.AVANZADO: Priority.MANTENER,
    },
    axes_order=FRUVER_AXES,
)


class DefaultScoringRulesProvider:
    def current(self, category: str) -> ScoringRules:
        if category != "fruver":
            raise NotFoundError(f"La categoría '{category}' aún no tiene reglas activas")
        return DEFAULT_RULES
