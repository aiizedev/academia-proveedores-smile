import { describe, expect, it } from "vitest";
import paths from "../../../../contracts/fixtures/form-paths.json";
import bankJson from "../../../../contracts/fixtures/question-bank.json";
import { evaluateForm, prefilledAnswers, type Answers, type QuestionBank, type Size } from "./form";

const bank = bankJson as unknown as QuestionBank;

describe(`caminos del formulario (form-paths v${paths.version}, ${paths.bank_version})`, () => {
  it("usa el mismo banco que el fixture", () => {
    expect(bank.version).toBe(paths.bank_version);
  });

  for (const c of paths.cases) {
    describe(c.name, () => {
      const profile = { category: c.category, size: c.size as Size };
      const result = evaluateForm(bank, profile, c.answers as unknown as Answers);

      it("muestra exactamente las preguntas del camino", () => {
        expect(result.visible).toEqual(c.expected.visible);
      });
      it("puntúa ejes y Pilar 1", () => {
        expect(result.axes).toEqual(c.expected.axes);
        expect(result.pillar1).toBe(c.expected.pillar1);
      });
      it("arma el plan con el siguiente paso de cada meta", () => {
        expect(result.plan.map((p) => ({ axis: p.axis, priority: p.priority, question: p.question, next_step: p.nextStep }))).toEqual(c.expected.plan);
      });
    });
  }

  it("prellena amb-09 según la categoría", () => {
    expect(prefilledAnswers(bank, { category: "fruver", size: "micro" })).toEqual({ "amb-09": "si" });
    expect(prefilledAnswers(bank, { category: "insumos", size: "micro" })).toEqual({ "amb-09": "no" });
  });
});

describe("contexto del formulario", async () => {
  const { bankCategory, cycleFor } = await import("./cycle");
  it("calcula el ciclo cuatrimestral en hora de Colombia", () => {
    expect(cycleFor(new Date("2026-10-16T12:00:00Z"))).toBe("2026-C3");
    expect(cycleFor(new Date("2026-05-01T04:00:00Z"))).toBe("2026-C1"); // aún 30/04 en Bogotá
    expect(cycleFor(new Date("2027-01-10T12:00:00Z"))).toBe("2027-C1");
  });
  it("traduce la categoría del catálogo a la del banco", () => {
    expect(bankCategory("pescados_mariscos")).toBe("pescados");
    expect(bankCategory("otra")).toBeNull();
  });
});
