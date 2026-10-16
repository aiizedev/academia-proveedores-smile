/* Diagnóstico del proveedor (RF-ASM-007, RF-ASM-009, RF-ASM-013, CU-06).
   Puro: se calcula en el teléfono sobre la autoevaluación enviada y se
   reemplaza por el oficial cuando llegue por sync. */
import { answerValue, evaluateForm, isCritical, visibleQuestions, type Answers, type FormResult, type PlanStep, type Profile, type QuestionBank } from "./form";
import { levelFor, round2, type LevelId } from "./scoring";

/** BPA del ICA para producción primaria: las preguntas mapeadas a esta norma miden la cercanía (RF-ASM-009). */
export const BPA_FRAMEWORK = "Res. ICA 30021 de 2017";

export const URGENT_ALERT = "Identificamos un riesgo que requiere atención inmediata.";

export interface CriticalAlert {
  questionId: string;
  axis: string;
  message: string;
}

export interface Diagnosis extends FormResult {
  level: LevelId | null;
  /** 0–100, o null si ninguna pregunta visible está mapeada a BPA. */
  bpaProximity: number | null;
  alerts: CriticalAlert[];
  nextStep: PlanStep | null;
}

type FrameworkQuestion = { frameworks?: readonly string[] };

export function diagnose(bank: QuestionBank, profile: Profile, answers: Answers): Diagnosis {
  const result = evaluateForm(bank, profile, answers);
  const visible = visibleQuestions(bank, profile, answers);

  let earned = 0;
  let possible = 0;
  for (const q of visible) {
    if (!(q as FrameworkQuestion).frameworks?.includes(BPA_FRAMEWORK)) continue;
    const value = answerValue(q, answers[q.id]);
    if (value === null) continue;
    earned += q.weight * value;
    possible += q.weight;
  }

  const alerts = visible
    .filter((q) => q.axis !== null && isCritical(q, answers[q.id]))
    .map((q): CriticalAlert => ({ questionId: q.id, axis: q.axis!, message: q.critical_message ?? URGENT_ALERT }));

  return {
    ...result,
    level: result.pillar1 === null ? null : levelFor(result.pillar1),
    bpaProximity: possible > 0 ? round2((earned / possible) * 100) : null,
    alerts,
    nextStep: result.plan[0] ?? null,
  };
}
