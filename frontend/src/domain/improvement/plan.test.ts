import { describe, expect, it } from "vitest";
import guidesContract from "../../../../contracts/fixtures/guides.json";
import paths from "../../../../contracts/fixtures/form-paths.json";
import bankJson from "../../../../contracts/fixtures/question-bank.json";
import { evaluateForm, type Answers, type QuestionBank, type Size } from "@/domain/assessment/form";
import { buildGoals, cycleEnd, goalProgress, type Guide } from "./plan";

const bank = bankJson as unknown as QuestionBank;
const guides = guidesContract.guides as Guide[];
const names = Object.fromEntries(bank.axes.map((a) => [a.code, a.name]));

describe("guías (contracts/fixtures/guides.json)", () => {
  it("hay una guía por eje del banco, con el id que el banco referencia", () => {
    expect(bank.axes.map((a) => a.guide).sort()).toEqual(guides.map((g) => g.id).sort());
  });
  it("la de residuos trae el triple lavado en 4 etapas y su fuente (HU-IMP-02)", () => {
    const residuos = guides.find((g) => g.axis === "residuos")!;
    expect(residuos.steps.filter((s) => s.title.startsWith("Triple lavado"))).toHaveLength(4);
    expect(residuos.source).toContain("Decreto 1076 de 2015 / CampoLimpio");
  });
});

describe("ruta de 3 metas (HU-IMP-01)", () => {
  const c = paths.cases[0]!;
  const result = evaluateForm(bank, { category: c.category, size: c.size as Size }, c.answers as unknown as Answers);
  const goals = buildGoals(result.plan, result.axes, names, guides, "2026-C3");

  it("sigue el orden del plan y usa el siguiente paso como acción", () => {
    expect(goals.map((g) => [g.position, g.axis, g.priority])).toEqual(c.expected.plan.map((p, i) => [i + 1, p.axis, p.priority]));
    expect(goals[0]!.action).toBe(c.expected.plan[0]!.next_step);
  });

  it("cada meta tiene hallazgo, responsable, fecha límite al cierre del ciclo y evidencia", () => {
    for (const g of goals) {
      expect(g.finding).toMatch(/nivel/);
      expect(g.owner).toBe("Yo");
      expect(g.dueOn).toBe("2026-12-31");
      expect(g.expectedEvidence.length).toBeGreaterThan(0);
    }
  });

  it("cierre de cada ciclo", () => {
    expect([cycleEnd("2027-C1"), cycleEnd("2027-C2"), cycleEnd("2028-C1")]).toEqual(["2027-04-30", "2027-08-31", "2028-04-30"]);
  });
});

describe("checklist (HU-IMP-03)", () => {
  const guide = guides[0]!;
  const ids = guide.checklist.map((i) => i.id);
  it("4 de 4 marcados completa la meta; desmarcar uno la reabre", () => {
    expect(goalProgress(guide, new Set(ids.slice(0, 3)))).toEqual({ done: 3, total: 4, complete: false });
    expect(goalProgress(guide, new Set(ids))).toEqual({ done: 4, total: 4, complete: true });
  });
});
