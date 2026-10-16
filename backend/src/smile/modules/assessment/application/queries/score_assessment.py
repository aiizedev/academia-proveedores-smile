"""Caso de uso `ScoreAssessment`: calcula ejes, Pilar 1 y plan sin persistir (vista previa)."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass, field

from smile.modules.assessment.application.ports.rules import ScoringRulesProvider
from smile.modules.assessment.domain.scoring import (
    Answer,
    AnsweredQuestion,
    AssessmentScore,
    score_assessment,
)


@dataclass(frozen=True, kw_only=True)
class AnswerInput:
    id: str
    axis: str
    weight: int
    answer: str
    critical_when: Sequence[str] = field(default_factory=tuple)


@dataclass(frozen=True, kw_only=True)
class ScoreAssessmentQuery:
    category: str
    answers: Sequence[AnswerInput]


class ScoreAssessment:
    def __init__(self, rules: ScoringRulesProvider) -> None:
        self._rules = rules

    def execute(self, query: ScoreAssessmentQuery) -> AssessmentScore:
        rules = self._rules.current(query.category)
        questions = [
            AnsweredQuestion(
                id=a.id,
                axis=a.axis,
                weight=a.weight,
                answer=Answer(a.answer),
                critical_when=frozenset(Answer(c) for c in a.critical_when),
            )
            for a in query.answers
        ]
        return score_assessment(questions, rules)
