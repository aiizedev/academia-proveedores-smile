"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Answer, Button, Checkbox, Field, LeafBar, QuestionChip } from "@/components/ui";
import type { Assessment } from "@/data/db/models";
import { DECLARATION } from "@/domain/assessment/cycle";
import { pendingRequired, prefilledAnswers, visibleQuestions, type Answers, type BankQuestion, type FormAnswer, type Profile } from "@/domain/assessment/form";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { BANK, useAssessment, useAssessmentActions, type StoredAnswer } from "./hooks";

/* CU-05 · HU-ASM-03. Una pregunta por pantalla (U-01), autoguardado (U-07),
   reanudar en la primera pendiente y declaración antes de enviar (RF-PRV-004). */
const AXIS_NAME = Object.fromEntries(BANK.axes.map((a) => [a.code, a.name]));
const SECTION_OF = Object.fromEntries(BANK.sections.flatMap((s) => s.questions.map((q) => [q.id, s])));
const ADVANCE_MS = 560;
const ADVANCE_REDUCED_MS = 150;

const toAnswers = (stored: Record<string, StoredAnswer>): Answers => Object.fromEntries(Object.entries(stored).map(([id, s]) => [id, s.answer]));

function Intro({ total, onStart }: { total: number; onStart: () => void }) {
  return (
    <section className="flex flex-col gap-5">
      <p className="a-eyebrow">Autoevaluación</p>
      <h1 className="a-title">
        Conozca cómo va su <em>finca</em>
      </h1>
      <p className="text-app-body">
        Son unas {total} preguntas de Sí o No, una por pantalla. Le toma unos 5 minutos y puede pausar cuando quiera.
      </p>
      <Button onClick={onStart} icon={<Icon name="arrow" />}>
        Empezar
      </Button>
    </section>
  );
}

function QuestionScreen({
  question,
  stored,
  position,
  total,
  answered,
  onAnswer,
  onBack,
}: {
  question: BankQuestion;
  stored: StoredAnswer | undefined;
  position: number;
  total: number;
  /** Preguntas antes de la actual: en la 5 de 8 la barra marca 50 % (HU-ASM-03). */
  answered: number;
  onAnswer: (answer: FormAnswer, detail: string) => void;
  onBack: (() => void) | null;
}) {
  const reduced = useReducedMotion();
  const [choice, setChoice] = useState<FormAnswer | undefined>(stored?.answer);
  const [detail, setDetail] = useState(stored?.detail ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const section = SECTION_OF[question.id];
  const asksDetail = question.detail !== undefined && choice === question.detail.when;
  const multi = question.type === "multi_choice";
  const selected = Array.isArray(choice) ? choice : [];

  const pick = (answer: FormAnswer) => {
    setChoice(answer);
    if (question.detail && answer === question.detail.when) return; // espera el detalle opcional
    timer.current = setTimeout(() => onAnswer(answer, ""), reduced ? ADVANCE_REDUCED_MS : ADVANCE_MS);
  };

  const options: Array<[FormAnswer, string]> = [
    ["si", "Sí"],
    ["no", "No"],
    ...(question.type === "yes_no_na" ? ([["na", "No aplica"]] as Array<[FormAnswer, string]>) : []),
  ];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <p className="a-eyebrow">{section?.title}</p>
        <LeafBar value={answered} total={total} />
        <p className="sr-only">
          Pregunta {position} de {total}
        </p>
      </div>
      {question.axis ? <QuestionChip>{AXIS_NAME[question.axis] ?? question.axis}</QuestionChip> : null}
      <h1 className="font-display text-app-question leading-[var(--lh-snug)]">{question.text}</h1>

      {multi ? (
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Marque todas las que use</legend>
          {question.options?.map((o) => (
            <Checkbox
              key={o.code}
              checked={selected.includes(o.code)}
              onChange={(e) => setChoice(e.target.checked ? [...selected, o.code] : selected.filter((c) => c !== o.code))}
            >
              {o.label}
            </Checkbox>
          ))}
        </fieldset>
      ) : (
        <div className="flex flex-col gap-3">
          {options.map(([value, label]) => (
            <Answer key={label} selected={choice === value} onClick={() => pick(value)}>
              {label}
            </Answer>
          ))}
        </div>
      )}

      {asksDetail ? <Field label={`${question.detail!.label} (opcional)`} value={detail} onChange={(e) => setDetail(e.target.value)} /> : null}
      {multi || asksDetail ? (
        <Button disabled={multi && selected.length === 0} onClick={() => onAnswer(choice!, detail)} icon={<Icon name="arrow" />}>
          Continuar
        </Button>
      ) : null}
      {onBack ? (
        <Button variant="ghost" onClick={onBack}>
          Anterior
        </Button>
      ) : null}
    </section>
  );
}

function DeclarationScreen({ onSubmit, onBack }: { onSubmit: (name: string) => Promise<void>; onBack: () => void }) {
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const ready = accepted && name.trim().split(/\s+/).length >= 2;

  return (
    <section className="flex flex-col gap-5">
      <p className="a-eyebrow">Último paso</p>
      <h1 className="a-title">
        Declaración de <em>veracidad</em>
      </h1>
      <Checkbox checked={accepted} onChange={(e) => setAccepted(e.target.checked)}>
        {DECLARATION.text}
      </Checkbox>
      <Field label="Escriba su nombre completo" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} hint="Hace las veces de su firma." />
      <Button
        disabled={!ready || sending}
        onClick={async () => {
          setSending(true);
          await onSubmit(name).finally(() => setSending(false));
        }}
        icon={<Icon name="check" />}
      >
        Enviar
      </Button>
      <Button variant="ghost" onClick={onBack}>
        Revisar respuestas
      </Button>
    </section>
  );
}

function InProgress({ assessment, profile, stored }: { assessment: Assessment; profile: Profile; stored: Record<string, StoredAnswer> }) {
  const router = useRouter();
  const actions = useAssessmentActions();
  const answers = useMemo(() => toAnswers(stored), [stored]);
  const visible = useMemo(() => visibleQuestions(BANK, profile, answers), [profile, answers]);
  // Reanudar en la primera pregunta pendiente (HU-ASM-03 "pausa y reanudación").
  const [index, setIndex] = useState<number | null>(null);
  useEffect(() => {
    if (index !== null) return;
    const firstPending = pendingRequired(BANK, profile, answers)[0];
    setIndex(firstPending ? visible.findIndex((q) => q.id === firstPending) : visible.length);
  }, [index, profile, answers, visible]);

  if (index === null) return null;
  if (index >= visible.length) {
    return (
      <DeclarationScreen
        onBack={() => setIndex(Math.max(visible.length - 1, 0))}
        onSubmit={async (name) => {
          await actions.submit(assessment, name);
          router.push("/app/diagnostico");
        }}
      />
    );
  }

  const question = visible[index]!;
  return (
    <QuestionScreen
      key={question.id}
      question={question}
      stored={stored[question.id]}
      position={index + 1}
      total={visible.length}
      answered={index}
      onBack={index > 0 ? () => setIndex(index - 1) : null}
      onAnswer={async (answer, detail) => {
        await actions.saveAnswer(assessment, question.id, answer, detail, index + 1);
        setIndex(index + 1);
      }}
    />
  );
}

export function AssessmentFlow() {
  const state = useAssessment();
  const actions = useAssessmentActions();

  if (state.status === "loading") return <p className="text-app-body text-ink-soft">Abriendo su autoevaluación…</p>;
  if (state.status === "no-profile") {
    return (
      <section className="flex flex-col gap-5">
        <p className="a-eyebrow">Autoevaluación</p>
        <h1 className="a-title">Primero complete su ficha</h1>
        <p className="text-app-body">Las preguntas dependen de su categoría. Complete la ficha y vuelva aquí.</p>
        <Link href="/app/ficha" className="inline-flex min-h-[3.7rem] items-center justify-center rounded-button bg-olive-800 px-[1.4rem] text-app-button font-extrabold text-cream">
          Ir a mi ficha
        </Link>
      </section>
    );
  }

  const { profile, cycleId, assessment, answers } = state;
  if (!assessment) {
    const prefilled = prefilledAnswers(BANK, profile);
    const total = visibleQuestions(BANK, profile, prefilled).length;
    return <Intro total={total} onStart={() => void actions.start(cycleId, profile, prefilled)} />;
  }
  if (assessment.status === "submitted") {
    return (
      <section className="flex flex-col gap-5">
        <p className="a-eyebrow">Autoevaluación {cycleId}</p>
        <h1 className="a-title">
          Autoevaluación <em>enviada</em>
        </h1>
        <p role="status" className="text-app-body">
          Quedó guardada en su teléfono y se enviará cuando haya señal.
        </p>
        <Link href="/app/diagnostico" className="inline-flex min-h-[3.7rem] items-center justify-center rounded-button bg-olive-800 px-[1.4rem] text-app-button font-extrabold text-cream">
          Ver mi diagnóstico
        </Link>
      </section>
    );
  }
  return <InProgress assessment={assessment} profile={profile} stored={answers} />;
}
