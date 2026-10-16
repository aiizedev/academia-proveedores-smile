"""Router FastAPI de `assessment` (montado bajo /api/v1)."""

from typing import Annotated

from fastapi import APIRouter, Depends

from smile.modules.assessment.api.schemas import (
    AxisOut,
    PlanItemOut,
    ScorePreviewIn,
    ScorePreviewOut,
)
from smile.modules.assessment.application.queries.score_assessment import (
    AnswerInput,
    ScoreAssessment,
    ScoreAssessmentQuery,
)

router = APIRouter(prefix="/assessment", tags=["assessment"])


def get_score_assessment() -> ScoreAssessment:
    """Punto de inyección; `module.py` lo reemplaza por la implementación concreta."""
    raise NotImplementedError("assessment no está cableado: falta module.dependency_overrides")


@router.post("/score-preview", response_model=ScorePreviewOut)
def score_preview(
    body: ScorePreviewIn,
    use_case: Annotated[ScoreAssessment, Depends(get_score_assessment)],
) -> ScorePreviewOut:
    """Calcula ejes, Pilar 1 y plan de 3 metas sin persistir (RF-ASM-005…008, RF-IMP-001)."""
    result = use_case.execute(
        ScoreAssessmentQuery(
            category=body.category,
            answers=[AnswerInput(**a.model_dump()) for a in body.answers],
        )
    )
    return ScorePreviewOut(
        axes={
            k: AxisOut(
                score=float(v.score) if v.score is not None else None,
                level=v.level.value if v.level else None,
                urgent=v.urgent,
            )
            for k, v in result.axes.items()
        },
        pillar1=float(result.pillar1) if result.pillar1 is not None else None,
        plan=[PlanItemOut(axis=p.axis, priority=p.priority.value) for p in result.plan],
    )
