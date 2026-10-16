/* Ruta de 3 metas (RF-IMP-001, RF-IMP-002, RF-IMP-004, CU-07). Puras: arman
   cada meta desde el plan del diagnóstico y miden su avance por checklist. */
import type { AxisResult, LevelId, PlanPriority } from "@/domain/assessment/scoring";

export interface Guide {
  id: string;
  axis: string;
  title: string;
  minutes: number;
  intro: string;
  steps: ReadonlyArray<{ title: string; detail: string }>;
  checklist: ReadonlyArray<{ id: string; text: string }>;
  tip: string;
  source: string;
  expected_evidence: string;
}

export interface PlanInput {
  axis: string;
  priority: PlanPriority;
  nextStep: string;
}

export interface Goal {
  position: number;
  axis: string;
  priority: PlanPriority;
  finding: string;
  action: string;
  owner: string;
  /** AAAA-MM-DD: último día del ciclo. */
  dueOn: string;
  expectedEvidence: string;
  guide: Guide;
}

const LEVEL_TEXT: Record<LevelId, string> = { inicial: "inicial", desarrollo: "en desarrollo", avanzado: "avanzado" };

/** Último día del ciclo cuatrimestral: C1 → 30/04, C2 → 31/08, C3 → 31/12. */
export function cycleEnd(cycleId: string): string {
  const [year, c] = cycleId.split("-C");
  const lastMonth = Number(c) * 4;
  const lastDay = new Date(Date.UTC(Number(year), lastMonth, 0)).getUTCDate();
  return `${year}-${String(lastMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

/** Hallazgo en lenguaje llano a partir del resultado del eje. */
export function findingFor(axisName: string, result: AxisResult): string {
  if (result.score === null || result.level === null) return `${axisName}: sin preguntas que apliquen a su finca.`;
  const base = `${axisName}: nivel ${LEVEL_TEXT[result.level]} (${Math.round(result.score)} %).`;
  return result.urgent ? `${base} Hay un riesgo que requiere atención inmediata.` : base;
}

export function buildGoals(
  plan: readonly PlanInput[],
  axes: Readonly<Record<string, AxisResult>>,
  axisNames: Readonly<Record<string, string>>,
  guides: readonly Guide[],
  cycleId: string,
): Goal[] {
  return plan.flatMap((item, i) => {
    const guide = guides.find((g) => g.axis === item.axis);
    const result = axes[item.axis];
    if (!guide || !result) return [];
    return [
      {
        position: i + 1,
        axis: item.axis,
        priority: item.priority,
        finding: findingFor(axisNames[item.axis] ?? item.axis, result),
        action: item.nextStep,
        owner: "Yo",
        dueOn: cycleEnd(cycleId),
        expectedEvidence: guide.expected_evidence,
        guide,
      },
    ];
  });
}

export interface Progress {
  done: number;
  total: number;
  complete: boolean;
}

/** Una meta está completa cuando todos sus ítems están marcados (HU-IMP-03). */
export function goalProgress(guide: Pick<Guide, "checklist">, checked: ReadonlySet<string>): Progress {
  const total = guide.checklist.length;
  const done = guide.checklist.filter((item) => checked.has(item.id)).length;
  return { done, total, complete: total > 0 && done === total };
}
