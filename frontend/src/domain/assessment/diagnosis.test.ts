import { describe, expect, it } from "vitest";
import paths from "../../../../contracts/fixtures/form-paths.json";
import bankJson from "../../../../contracts/fixtures/question-bank.json";
import { diagnose } from "./diagnosis";
import { visibleQuestions, type Answers, type QuestionBank, type Size } from "./form";

const bank = bankJson as unknown as QuestionBank;
const run = (i: number) => {
  const c = paths.cases[i]!;
  return diagnose(bank, { category: c.category, size: c.size as Size }, c.answers as unknown as Answers);
};

describe("diagnóstico (HU-ASM-05)", () => {
  it("nivel general por el Pilar 1 y siguiente paso = meta 1 del plan", () => {
    const d = run(0);
    expect(d.pillar1).toBe(66.66);
    expect(d.level).toBe("desarrollo");
    expect(d.nextStep).toEqual(expect.objectContaining({ axis: "residuos", question: "amb-05" }));
    expect(d.alerts).toEqual([]);
  });

  it.each(paths.cases.map((c, i) => [c.name, i] as const))("cercanía a BPA ICA según el fixture: %s", (_name, i) => {
    expect(run(i).bpaProximity).toBe(paths.cases[i]!.expected.bpa_ica_proximity);
  });

  it("alertas críticas con el mensaje de cada pregunta", () => {
    const d = run(1);
    expect(d.alerts.map((a) => a.questionId)).toEqual(["ext-01", "ext-18"]);
    expect(d.alerts.every((a) => a.message.length > 0)).toBe(true);
    expect(d.nextStep?.priority).toBe("urgente");
  });

  // SPEC-SOT D2 §3.1 #3: sin siglas de reporte corporativo en la PWA rural.
  it.each(["fruver", "lacteos", "carnes", "pescados_mariscos", "insumos_servicios"])("sin GRI/TCFD/SASB en el camino rural de %s", (category) => {
    for (const size of ["micro", "pequena"] as const) {
      const all: Answers = Object.fromEntries(bank.sections.flatMap((s) => s.questions).map((q) => [q.id, "si"]));
      const texts = visibleQuestions(bank, { category, size }, all).flatMap((q) => [q.text, q.next_step ?? "", q.critical_message ?? ""]);
      expect(texts.filter((t) => /\b(GRI|TCFD|SASB)\b/.test(t))).toEqual([]);
    }
  });
});
