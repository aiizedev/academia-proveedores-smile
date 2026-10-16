/* Formulario de autoevaluación con caminos (RF-ASM-001, S-18…S-21). Puras:
   composición visible, valor de cada respuesta y siguiente paso por meta.
   Validado con contracts/fixtures/form-paths.json sobre question-bank.json;
   el backend reproduce los mismos casos. */
import { evaluateAssessment, type AnsweredQuestion, type AssessmentResult, type PlanItem, type ScoringRules, DEFAULT_RULES } from "./scoring";

export type Size = "micro" | "pequena" | "mediana" | "grande";
export type YesNo = "si" | "no";
export type FormAnswer = YesNo | "na" | "pnr" | string[];
export type Answers = Readonly<Record<string, FormAnswer>>;

export interface Condition {
  question: string;
  in: readonly string[];
}

export interface BankQuestion {
  id: string;
  axis: string | null;
  weight: number;
  type: "yes_no" | "yes_no_na" | "multi_choice";
  required: boolean;
  text: string;
  categories: readonly string[];
  min_size: string;
  polarity: "positive" | "negative";
  show_if?: readonly Condition[];
  critical_when?: readonly string[];
  critical_message?: string;
  options?: ReadonlyArray<{ code: string; label: string; low_emission: boolean }>;
  detail?: { when: string; label: string; required: boolean };
  prefill?: { from: "category"; value_si_if: readonly string[]; editable: boolean };
  role?: string;
  next_step?: string;
}

export interface BankSection {
  code: string;
  title: string;
  intro?: string;
  categories: readonly string[];
  show_if?: readonly Condition[];
  questions: readonly BankQuestion[];
}

export interface QuestionBank {
  version: string;
  sizes_order: readonly string[];
  axes_order: readonly string[];
  sections: readonly BankSection[];
  axes: ReadonlyArray<{ code: string; name: string; guide: string; maintain_step: string }>;
}

export interface Profile {
  category: string;
  size: Size;
}

const matchesCategory = (categories: readonly string[], category: string) => categories.includes("all") || categories.includes(category);

function conditionsMet(conditions: readonly Condition[] | undefined, answers: Answers): boolean {
  return (conditions ?? []).every((c) => {
    const answer = answers[c.question];
    return typeof answer === "string" && c.in.includes(answer);
  });
}

/** Respuestas que el formulario trae ya puestas (amb-09 según la categoría, S-19). Editables. */
export function prefilledAnswers(bank: QuestionBank, profile: Profile): Record<string, FormAnswer> {
  const prefilled: Record<string, FormAnswer> = {};
  for (const q of bank.sections.flatMap((s) => s.questions)) {
    if (q.prefill?.from === "category") prefilled[q.id] = q.prefill.value_si_if.includes(profile.category) ? "si" : "no";
  }
  return prefilled;
}

/** Preguntas visibles en orden del banco para el perfil y las respuestas dadas (S-19). */
export function visibleQuestions(bank: QuestionBank, profile: Profile, answers: Answers): BankQuestion[] {
  const sizeRank = (size: string) => bank.sizes_order.indexOf(size);
  const visible: BankQuestion[] = [];
  for (const section of bank.sections) {
    if (!matchesCategory(section.categories, profile.category) || !conditionsMet(section.show_if, answers)) continue;
    for (const q of section.questions) {
      if (!matchesCategory(q.categories, profile.category)) continue;
      if (sizeRank(q.min_size) > sizeRank(profile.size)) continue;
      // Las condiciones miran solo preguntas visibles: una respuesta oculta no abre caminos.
      const visibleAnswers = Object.fromEntries(visible.map((v) => [v.id, answers[v.id]]).filter(([, a]) => a !== undefined));
      if (!conditionsMet(q.show_if, visibleAnswers)) continue;
      visible.push(q);
    }
  }
  return visible;
}

/** Valor 0–1 de una respuesta, o null si no puntúa (na, pnr, sin responder, sin eje). */
export function answerValue(q: BankQuestion, answer: FormAnswer | undefined): number | null {
  if (q.axis === null || answer === undefined) return null;
  if (Array.isArray(answer)) {
    // S-18: 1 si todo lo marcado es de baja emisión, 0,5 si hay mezcla, 0 si nada lo es.
    const low = answer.map((code) => q.options?.find((o) => o.code === code)?.low_emission ?? false);
    if (low.length === 0) return null;
    return low.every(Boolean) ? 1 : low.some(Boolean) ? 0.5 : 0;
  }
  if (answer !== "si" && answer !== "no") return null;
  const positive = answer === "si" ? 1 : 0;
  return q.polarity === "negative" ? 1 - positive : positive; // S-21
}

export function isCritical(q: BankQuestion, answer: FormAnswer | undefined): boolean {
  return typeof answer === "string" && (q.critical_when?.includes(answer) ?? false);
}

export interface PlanStep extends PlanItem {
  question: string | null;
  nextStep: string;
}

export interface FormResult extends Omit<AssessmentResult, "plan"> {
  visible: string[];
  plan: PlanStep[];
}

export function evaluateForm(bank: QuestionBank, profile: Profile, answers: Answers, rules: ScoringRules = DEFAULT_RULES): FormResult {
  const visible = visibleQuestions(bank, profile, answers);
  const scored: AnsweredQuestion[] = [];
  for (const q of visible) {
    const value = answerValue(q, answers[q.id]);
    if (value === null || q.axis === null) continue;
    const raw = answers[q.id];
    scored.push({
      id: q.id,
      axis: q.axis,
      weight: q.weight,
      answer: typeof raw === "string" ? (raw as AnsweredQuestion["answer"]) : "si",
      value,
      criticalWhen: q.critical_when as AnsweredQuestion["criticalWhen"],
    });
  }
  const result = evaluateAssessment(scored, { ...rules, axesOrder: bank.axes_order });

  // S-20: siguiente paso de cada meta = peor pregunta incumplida de su eje.
  const bankIndex = new Map(bank.sections.flatMap((s) => s.questions).map((q, i) => [q.id, i]));
  const plan = result.plan.map((item): PlanStep => {
    const unmet = visible
      .filter((q) => q.axis === item.axis && (answerValue(q, answers[q.id]) ?? 1) < 1)
      .sort(
        (a, b) =>
          Number(isCritical(b, answers[b.id])) - Number(isCritical(a, answers[a.id])) ||
          b.weight - a.weight ||
          bankIndex.get(a.id)! - bankIndex.get(b.id)!,
      );
    const worst = unmet[0];
    const maintain = bank.axes.find((a) => a.code === item.axis)?.maintain_step ?? "";
    return { ...item, question: worst?.id ?? null, nextStep: worst?.next_step ?? maintain };
  });

  return { ...result, visible: visible.map((q) => q.id), plan };
}

/** Preguntas obligatorias visibles aún sin responder: el envío espera a que sean 0. */
export function pendingRequired(bank: QuestionBank, profile: Profile, answers: Answers): string[] {
  return visibleQuestions(bank, profile, answers)
    .filter((q) => q.required && (answers[q.id] === undefined || (Array.isArray(answers[q.id]) && (answers[q.id] as string[]).length === 0)))
    .map((q) => q.id);
}
