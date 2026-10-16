/* Motor de puntaje del Pilar 1 — espejo TS del dominio Python (ADR-0005).
   Reglas: RF-ASM-005…008, RF-IMP-001 y supuestos S-01, S-02, S-03, S-09.
   Validado contra contracts/fixtures/assessment-scoring.json: si cambias algo
   aquí, el fixture y el backend deben cambiar en el mismo PR. Funciones puras. */

export type AnswerValue = "si" | "aveces" | "no" | "na" | "pnr";
export type LevelId = "inicial" | "desarrollo" | "avanzado";
export type PlanPriority = "urgente" | "alta" | "media" | "mantener";

export interface ScoringRules {
  answerValues: Record<"si" | "aveces" | "no", number>;
  excludedAnswers: readonly AnswerValue[];
  /** Ordenados de menor a mayor `min`. */
  levels: ReadonlyArray<{ id: LevelId; min: number }>;
  priorityByLevel: Record<LevelId, Exclude<PlanPriority, "urgente">>;
  axesOrder: readonly string[];
}

export interface AnsweredQuestion {
  id: string;
  axis: string;
  weight: number;
  answer: AnswerValue;
  /** Valor 0–1 ya calculado (polaridad S-21, multiselección S-18); si falta se usa `answerValues`. */
  value?: number;
  criticalWhen?: readonly AnswerValue[];
}

export interface AxisResult {
  score: number | null;
  level: LevelId | null;
  urgent: boolean;
}

export interface PlanItem {
  axis: string;
  priority: PlanPriority;
}

export interface AssessmentResult {
  axes: Record<string, AxisResult>;
  pillar1: number | null;
  plan: PlanItem[];
}

/** Valores por defecto (S-01, S-03, S-09). En producción llegan versionados desde `catalog`. */
export const DEFAULT_RULES: ScoringRules = {
  answerValues: { si: 1, aveces: 0.5, no: 0 },
  excludedAnswers: ["na", "pnr"],
  levels: [
    { id: "inicial", min: 0 },
    { id: "desarrollo", min: 40 },
    { id: "avanzado", min: 75 },
  ],
  priorityByLevel: { inicial: "alta", desarrollo: "media", avanzado: "mantener" },
  axesOrder: ["bpa", "residuos", "carbono", "infantil", "ddhh"],
};

const PLAN_SIZE = 3;

/** Redondeo a 2 decimales half-up (mismo criterio que Decimal.ROUND_HALF_UP en Python). */
export function round2(value: number): number {
  const sign = value < 0 ? -1 : 1;
  return (sign * Math.round(Math.abs(value) * 100 + 1e-9)) / 100;
}

export function levelFor(score: number, rules: ScoringRules = DEFAULT_RULES): LevelId {
  let current: LevelId = rules.levels[0]?.id ?? "inicial";
  for (const level of rules.levels) if (score >= level.min) current = level.id;
  return current;
}

export function scoreAxis(questions: readonly AnsweredQuestion[], rules: ScoringRules = DEFAULT_RULES): AxisResult {
  const applicable = questions.filter((q) => !rules.excludedAnswers.includes(q.answer));
  if (applicable.length === 0) return { score: null, level: null, urgent: false };

  let earned = 0;
  let possible = 0;
  for (const q of applicable) {
    earned += q.weight * (q.value ?? rules.answerValues[q.answer as keyof ScoringRules["answerValues"]]);
    possible += q.weight;
  }
  const score = round2((earned / possible) * 100);
  const urgent = applicable.some((q) => q.criticalWhen?.includes(q.answer) ?? false);
  let level = levelFor(score, rules);
  // RF-ASM-007: una respuesta crítica impide el nivel Avanzado.
  if (urgent && level === "avanzado") level = "desarrollo";
  return { score, level, urgent };
}

export function buildPlan(axes: Record<string, AxisResult>, rules: ScoringRules = DEFAULT_RULES): PlanItem[] {
  const order = (axis: string) => rules.axesOrder.indexOf(axis);
  const scored = rules.axesOrder.filter((a) => axes[a]?.score != null);
  const rank = (a: string) => {
    const r = axes[a]!;
    if (r.urgent) return 0;
    return r.level === "inicial" ? 1 : 2;
  };

  const gaps = scored
    .filter((a) => axes[a]!.urgent || axes[a]!.level !== "avanzado")
    .sort((a, b) => rank(a) - rank(b) || axes[a]!.score! - axes[b]!.score! || order(a) - order(b));

  const plan: PlanItem[] = gaps.slice(0, PLAN_SIZE).map((axis) => {
    const r = axes[axis]!;
    return { axis, priority: r.urgent ? "urgente" : rules.priorityByLevel[r.level!] };
  });

  if (plan.length < PLAN_SIZE) {
    const fill = scored
      .filter((a) => !gaps.includes(a))
      .sort((a, b) => axes[a]!.score! - axes[b]!.score! || order(a) - order(b))
      .slice(0, PLAN_SIZE - plan.length)
      .map((axis): PlanItem => ({ axis, priority: "mantener" }));
    plan.push(...fill);
  }
  return plan;
}

export function evaluateAssessment(questions: readonly AnsweredQuestion[], rules: ScoringRules = DEFAULT_RULES): AssessmentResult {
  const axes: Record<string, AxisResult> = {};
  for (const axis of rules.axesOrder) {
    axes[axis] = scoreAxis(questions.filter((q) => q.axis === axis), rules);
  }
  const values = Object.values(axes)
    .map((r) => r.score)
    .filter((s): s is number => s !== null);
  const pillar1 = values.length ? round2(values.reduce((sum, s) => sum + s, 0) / values.length) : null;
  return { axes, pillar1, plan: buildPlan(axes, rules) };
}
