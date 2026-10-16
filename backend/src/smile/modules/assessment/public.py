"""API pública de `assessment`: única superficie importable por otros módulos."""

from smile.modules.assessment.application.queries.score_assessment import (
    AnswerInput,
    ScoreAssessment,
    ScoreAssessmentQuery,
)
from smile.modules.assessment.domain.scoring import AssessmentScore, Level, Priority

#: Nombres de eventos publicados (arquitectura.md §3.3).
ASSESSMENT_SUBMITTED = "assessment.AssessmentSubmitted"
CRITICAL_RISK_DETECTED = "assessment.CriticalRiskDetected"

__all__ = [
    "ASSESSMENT_SUBMITTED",
    "CRITICAL_RISK_DETECTED",
    "AnswerInput",
    "AssessmentScore",
    "Level",
    "Priority",
    "ScoreAssessment",
    "ScoreAssessmentQuery",
]
