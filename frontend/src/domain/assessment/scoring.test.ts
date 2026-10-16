import { describe, expect, it } from "vitest";
import fixture from "../../../../contracts/fixtures/assessment-scoring.json";
import { evaluateAssessment, type AnswerValue, type ScoringRules } from "./scoring";

// Contrato compartido con el backend (ADR-0005). No editar los casos aquí.
const rules: ScoringRules = {
  answerValues: fixture.answer_values,
  excludedAnswers: fixture.excluded_answers as AnswerValue[],
  levels: fixture.levels as ScoringRules["levels"],
  priorityByLevel: fixture.priority_by_level as ScoringRules["priorityByLevel"],
  axesOrder: fixture.axes_order,
};

describe("motor de puntaje (fixture compartido v" + fixture.version + ")", () => {
  for (const c of fixture.cases) {
    it(c.name, () => {
      const questions = c.questions.map((q) => ({
        id: q.id,
        axis: q.axis,
        weight: q.weight,
        answer: q.answer as AnswerValue,
        criticalWhen: "critical_when" in q ? (q.critical_when as AnswerValue[]) : undefined,
      }));
      const result = evaluateAssessment(questions, rules);
      expect(result.axes).toEqual(c.expected.axes);
      expect(result.pillar1).toBe(c.expected.pillar1);
      expect(result.plan).toEqual(c.expected.plan);
    });
  }
});
