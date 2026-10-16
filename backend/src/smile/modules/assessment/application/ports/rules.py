"""Puerto para obtener las reglas vigentes (en R3 vendrán de `catalog` vía su API pública)."""

from typing import Protocol

from smile.modules.assessment.domain.scoring import ScoringRules


class ScoringRulesProvider(Protocol):
    def current(self, category: str) -> ScoringRules: ...
