from decimal import Decimal

import pytest

from smile.modules.assessment.domain.scoring import Answer, AnsweredQuestion, score_assessment
from smile.modules.assessment.infrastructure.default_rules import DEFAULT_RULES
from smile.shared.domain.errors import DomainError


def test_weight_out_of_range_is_rejected() -> None:
    with pytest.raises(DomainError):
        AnsweredQuestion(id="q", axis="bpa", weight=6, answer=Answer.SI)


def test_unknown_axis_is_rejected() -> None:
    with pytest.raises(DomainError):
        score_assessment(
            [AnsweredQuestion(id="q", axis="otro", weight=1, answer=Answer.SI)], DEFAULT_RULES
        )


def test_all_excluded_gives_no_pillar() -> None:
    result = score_assessment(
        [AnsweredQuestion(id="q", axis="bpa", weight=1, answer=Answer.NO_APLICA)], DEFAULT_RULES
    )
    assert result.pillar1 is None
    assert result.plan == []


def test_threshold_boundary_is_inclusive() -> None:
    q = [
        AnsweredQuestion(id="a", axis="bpa", weight=3, answer=Answer.SI),
        AnsweredQuestion(id="b", axis="bpa", weight=1, answer=Answer.NO),
    ]
    assert score_assessment(q, DEFAULT_RULES).axes["bpa"].score == Decimal("75.00")
    assert score_assessment(q, DEFAULT_RULES).axes["bpa"].level.value == "avanzado"  # type: ignore[union-attr]
