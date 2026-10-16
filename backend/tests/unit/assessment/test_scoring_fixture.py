"""Las reglas Python deben coincidir con contracts/fixtures/assessment-scoring.json (ADR-0005)."""

from __future__ import annotations

import json
import os
from decimal import Decimal
from pathlib import Path
from typing import Any

import pytest

from smile.modules.assessment.domain.scoring import (
    Answer,
    AnsweredQuestion,
    Level,
    Priority,
    ScoringRules,
    score_assessment,
)


def _find_fixture() -> Path | None:
    if env := os.environ.get("CONTRACTS_DIR"):
        candidate = Path(env) / "fixtures" / "assessment-scoring.json"
        return candidate if candidate.exists() else None
    for parent in Path(__file__).resolve().parents:
        candidate = parent / "contracts" / "fixtures" / "assessment-scoring.json"
        if candidate.exists():
            return candidate
    return None


FIXTURE_PATH = _find_fixture()
FIXTURE: dict[str, Any] = json.loads(FIXTURE_PATH.read_text()) if FIXTURE_PATH else {"cases": []}

pytestmark = pytest.mark.skipif(
    FIXTURE_PATH is None, reason="contracts/ no disponible (p. ej. en Docker)"
)


def _rules(f: dict[str, Any]) -> ScoringRules:
    return ScoringRules(
        answer_values={Answer(k): Decimal(str(v)) for k, v in f["answer_values"].items()},
        excluded_answers=frozenset(Answer(a) for a in f["excluded_answers"]),
        level_thresholds=tuple((Level(lv["id"]), Decimal(str(lv["min"]))) for lv in f["levels"]),
        priority_by_level={Level(k): Priority(v) for k, v in f["priority_by_level"].items()},
        axes_order=tuple(f["axes_order"]),
    )


@pytest.mark.parametrize("case", FIXTURE["cases"], ids=lambda c: c["name"])
def test_case_matches_fixture(case: dict[str, Any]) -> None:
    questions = [
        AnsweredQuestion(
            id=q["id"],
            axis=q["axis"],
            weight=q["weight"],
            answer=Answer(q["answer"]),
            critical_when=frozenset(Answer(c) for c in q.get("critical_when", [])),
        )
        for q in case["questions"]
    ]
    result = score_assessment(questions, _rules(FIXTURE))
    expected = case["expected"]

    for axis, exp in expected["axes"].items():
        got = result.axes[axis]
        exp_score = (
            None if exp["score"] is None else Decimal(str(exp["score"])).quantize(Decimal("0.01"))
        )
        assert got.score == exp_score, axis
        assert (got.level.value if got.level else None) == exp["level"], axis
        assert got.urgent == exp["urgent"], axis
    assert result.pillar1 == Decimal(str(expected["pillar1"])).quantize(Decimal("0.01"))
    assert [(p.axis, p.priority.value) for p in result.plan] == [
        (p["axis"], p["priority"]) for p in expected["plan"]
    ]
