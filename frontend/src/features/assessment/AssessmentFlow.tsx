"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { MaskWords, Skeleton, SkeletonText } from "@/components/motion";
import { Answer, Button, ButtonLink, Checkbox, Field, LeafBar, QuestionChip } from "@/components/ui";
import type { Assessment } from "@/data/db/models";
import { DECLARATION } from "@/domain/assessment/cycle";
import { pendingRequired, prefilledAnswers, visibleQuestions, type Answers, type BankQuestion, type FormAnswer, type Profile } from "@/domain/assessment/form";
import { EASING, T } from "@/design/motion-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DEMO_OPEN } from "@/lib/env";
import { Analyzing } from "./Analyzing";
import { BANK, useAssessment, useAssessmentActions, type StoredAnswer } from "./hooks";

/* CU-05 · HU-ASM-03. Una pregunta por pantalla (U-01), autoguardado (U-07),
   reanudar en la primera pendiente y declaración antes de enviar (RF-PRV-004).
   Demo: /app/autoevaluacion?nueva=1 abre un borrador de práctica aparte, sin
   tocar la autoevaluación ni el diagnóstico del ciclo. */
const AXIS_NAME = Object.fromEntries(BANK.axes.map((a) => [a.code, a.name]));
const AXIS_ICON: Record<string, IconName> = { bpa: "bpa", residuos: "residuos", carbono: "carbono", infantil: "infantil", ddhh: "ddhh" };
const SECTION_OF = Object.fromEntries(BANK.sections.flatMap((s) => s.questions.map((q) => [q.id, s])));
const ADVANCE_MS = 560;
const ADVANCE_REDUCED_MS = 150;
const PRACTICE_HREF = "/app/autoevaluacion?nueva=1";

const toAnswers = (stored: Record<string, StoredAnswer>): Answers => Object.fromEntries(Object.entries(stored).map(([id, s]) => [id, s.answer]));

/* ---------- piezas ---------- */

function PracticeBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-rose-100 px-[0.6rem] py-[0.28rem] text-app-chip font-extrabold uppercase tracking-[var(--tracking-chip)] text-rose-700">
      <Icon name="sparkle" size="0.8rem" /> Práctica
    </span>
  );
}

function LoadingQuestion() {
  return (
    <div className="flex flex-col gap-5 pt-2" aria-busy="true">
      <Skeleton className="h-3" rounded="var(--radius-pill)" />
      <Skeleton className="h-8 w-40" rounded="var(--radius-pill)" />
      <SkeletonText lines={3} />
      <div className="mt-6 flex flex-col gap-3">
        <Skeleton className="h-[4.6rem]" />
        <Skeleton className="h-[4.6rem]" />
      </div>
    </div>
  );
}

function Intro({ total, practice, onStart }: { total: number; practice: boolean; onStart: () => void }) {
  const items: Array<[IconName, string]> = [
    ["clock", "Unos 5 minutos; puede pausar cuando quiera."],
    ["check", `Son ${total} preguntas de Sí o No, una por pantalla.`],
    ["cloudOk", "Cada respuesta se guarda sola en su teléfono."],
  ];
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="a-eyebrow">Autoevaluación</p>
        {practice ? <PracticeBadge /> : null}
      </div>
      <motion.div
        className="grain relative -mx-1 overflow-hidden rounded-sheet bg-olive-800 px-5 pt-6 pb-7 text-cream"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={T.reveal}
      >
        <motion.span aria-hidden className="absolute -top-6 -right-8 size-40 text-olive-600 [&_svg]:[stroke-width:1]" initial={{ rotate: -30, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ duration: 1.4, ease: EASING.enter }}>
          <Icon name="flower" size="100%" />
        </motion.span>
        <MaskWords as="h1" text="Conozca cómo va su finca" emphasis={["finca"]} className="relative z-[2] max-w-[11ch] font-display text-[2.2rem] leading-none font-[350] tracking-[-0.035em] [&_em]:text-rose-300 [&_em]:[font-variation-settings:var(--fv-accent)]" delay={0.1} />
        <p className="relative z-[2] mt-4 max-w-[30ch] text-app-small text-olive-300">
          Al final le mostramos su puntaje, su nivel en cada eje y su siguiente paso.
        </p>
      </motion.div>
      <ul className="flex flex-col gap-2">
        {items.map(([icon, text], i) => (
          <motion.li key={text} className="flex items-center gap-3 rounded-button border border-line bg-white p-3 text-app-body" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ ...T.enter, delay: 0.3 + i * 0.08 }}>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-100 text-olive-800">
              <Icon name={icon} size="1.2rem" />
            </span>
            {text}
          </motion.li>
        ))}
      </ul>
      {practice ? <p className="text-app-caption text-ink-soft">Práctica de la demo: sus respuestas aquí no cambian el diagnóstico guardado del ciclo.</p> : null}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...T.enter, delay: 0.55 }}>
        <Button onClick={onStart} icon={<Icon name="arrow" />}>
          Empezar
        </Button>
      </motion.div>
    </section>
  );
}

function Help({ question }: { question: BankQuestion }) {
  const [open, setOpen] = useState(false);
  const axis = question.axis ? AXIS_NAME[question.axis] : null;
  if (!axis && !question.next_step) return null;
  return (
    <div className="flex flex-col">
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="inline-flex min-h-12 w-fit items-center gap-2 font-bold text-olive-600 underline decoration-olive-300 underline-offset-4">
        <Icon name="help" size="1.15rem" /> ¿Qué significa?
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={T.ui} className="inline-flex">
          <Icon name="arrow" size="0.9rem" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div key="help" className="overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASING.enter }}>
            <motion.div className="mt-1 flex gap-[0.6rem] rounded-control border border-dashed border-olive-300 bg-white px-4 py-[0.85rem] text-[0.88rem] leading-[1.45] text-ink-soft" initial={{ y: 16 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: EASING.enter }}>
              <span className="mt-[0.1rem] text-olive-600">
                <Icon name="bpa" size="1.15rem" />
              </span>
              <p>
                {axis ? (
                  <>
                    Esta pregunta cuenta para <strong className="text-ink">{axis}</strong>.{" "}
                  </>
                ) : null}
                {question.next_step ? <>Si todavía no lo hace, un primer paso es: {question.next_step}</> : null}
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function QuestionScreen({
  question,
  stored,
  onAnswer,
}: {
  question: BankQuestion;
  stored: StoredAnswer | undefined;
  onAnswer: (answer: FormAnswer, detail: string) => void;
}) {
  const reduced = useReducedMotion();
  const [choice, setChoice] = useState<FormAnswer | undefined>(stored?.answer);
  const [detail, setDetail] = useState(stored?.detail ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const asksDetail = question.detail !== undefined && choice === question.detail.when;
  const multi = question.type === "multi_choice";
  const selected = Array.isArray(choice) ? choice : [];

  const pick = (answer: FormAnswer) => {
    setChoice(answer);
    if (timer.current) clearTimeout(timer.current);
    if (question.detail && answer === question.detail.when) return; // espera el detalle opcional
    timer.current = setTimeout(() => onAnswer(answer, ""), reduced ? ADVANCE_REDUCED_MS : ADVANCE_MS);
  };

  const options: Array<["si" | "no" | "na", string]> = [
    ["si", "Sí"],
    ["no", "No"],
    ...(question.type === "yes_no_na" ? ([["na", "No aplica"]] as Array<["na", string]>) : []),
  ];

  const item = (i: number) => ({ initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASING.enter, delay: 0.2 + i * 0.07 } } });

  return (
    <div className="flex flex-col gap-5">
      {question.axis ? (
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: EASING.enter }}>
          <QuestionChip icon={AXIS_ICON[question.axis] ?? "check"}>{AXIS_NAME[question.axis] ?? question.axis}</QuestionChip>
        </motion.div>
      ) : null}
      <MaskWords as="h1" text={question.text} className="font-display text-app-question leading-[1.08] font-[380] tracking-[-0.03em] [font-variation-settings:var(--fv-app)]" />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASING.enter, delay: 0.25 }}>
        <Help question={question} />
      </motion.div>

      {multi ? (
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Marque todas las que use</legend>
          {question.options?.map((o, i) => (
            <motion.div key={o.code} {...item(i)}>
              <Checkbox checked={selected.includes(o.code)} onChange={(e) => setChoice(e.target.checked ? [...selected, o.code] : selected.filter((c) => c !== o.code))}>
                {o.label}
              </Checkbox>
            </motion.div>
          ))}
        </fieldset>
      ) : (
        <div className="flex flex-col gap-[0.7rem] pt-2">
          {options.map(([value, label], i) => (
            <motion.div key={label} {...item(i)}>
              <Answer kind={value} selected={choice === value} onClick={() => pick(value)}>
                {label}
              </Answer>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence initial={false}>
        {asksDetail ? (
          <motion.div key="detail" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={T.ui} className="overflow-hidden">
            <Field label={`${question.detail!.label} (opcional)`} value={detail} onChange={(e) => setDetail(e.target.value)} />
          </motion.div>
        ) : null}
      </AnimatePresence>
      {multi || asksDetail ? (
        <Button disabled={multi && selected.length === 0} onClick={() => onAnswer(choice!, detail)} icon={<Icon name="arrow" />}>
          Continuar
        </Button>
      ) : null}
    </div>
  );
}

function DeclarationScreen({ onSubmit, onBack }: { onSubmit: (name: string) => Promise<void>; onBack: () => void }) {
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const ready = accepted && name.trim().split(/\s+/).length >= 2;

  return (
    <div className="flex flex-col gap-5">
      <motion.span className="grid size-14 place-items-center rounded-full bg-rose-100 text-olive-800" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.8, ease: EASING.pop }}>
        <Icon name="seal" size="1.7rem" />
      </motion.span>
      <p className="a-eyebrow">Último paso</p>
      <MaskWords as="h1" text="Declaración de veracidad" emphasis={["veracidad"]} className="a-title" />
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
        {sending ? "Enviando…" : "Enviar"}
      </Button>
      <Button variant="ghost" onClick={onBack}>
        Revisar respuestas
      </Button>
    </div>
  );
}

/** Barra superior del recorrido: salir, avance con hoja y sección. */
function FlowTop({ section, answered, total, practice, onBack }: { section?: string; answered: number; total: number; practice: boolean; onBack: (() => void) | null }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Link href="/app" aria-label="Salir de la autoevaluación (se guarda lo respondido)" className="grid size-12 shrink-0 place-items-center rounded-full border border-line bg-white transition-[scale] duration-[var(--dur-press)] active:scale-[var(--press-scale-icon)]">
          <Icon name="no" size="1.1rem" />
        </Link>
        <p className="a-eyebrow min-w-0 flex-1 truncate">{section}</p>
        {practice ? <PracticeBadge /> : null}
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="Pregunta anterior" className="grid size-12 shrink-0 place-items-center rounded-full border border-line bg-white transition-[scale] duration-[var(--dur-press)] active:scale-[var(--press-scale-icon)]">
            <Icon name="back" size="1.1rem" />
          </button>
        ) : null}
      </div>
      <LeafBar value={answered} total={total} />
    </div>
  );
}

function InProgress({ assessment, profile, stored, practice, onSubmitted }: { assessment: Assessment; profile: Profile; stored: Record<string, StoredAnswer>; practice: boolean; onSubmitted: () => void }) {
  const actions = useAssessmentActions();
  const answers = useMemo(() => toAnswers(stored), [stored]);
  const visible = useMemo(() => visibleQuestions(BANK, profile, answers), [profile, answers]);
  // Reanudar en la primera pregunta pendiente (HU-ASM-03 "pausa y reanudación").
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  useEffect(() => {
    if (index !== null) return;
    const firstPending = pendingRequired(BANK, profile, answers)[0];
    setIndex(firstPending ? visible.findIndex((q) => q.id === firstPending) : visible.length);
  }, [index, profile, answers, visible]);

  if (index === null) return <LoadingQuestion />;

  const go = (next: number) => {
    setDir(next >= index ? 1 : -1);
    setIndex(next);
  };
  const atDeclaration = index >= visible.length;
  const question = atDeclaration ? null : visible[index]!;

  return (
    <section className="flex flex-col gap-6">
      <FlowTop
        section={question ? SECTION_OF[question.id]?.title : "Declaración"}
        answered={Math.min(index, visible.length)}
        total={visible.length}
        practice={practice}
        onBack={index > 0 ? () => go(Math.min(index, visible.length) - 1) : null}
      />
      <p className="sr-only" aria-live="polite">
        {question ? `Pregunta ${index + 1} de ${visible.length}` : "Declaración de veracidad"}
      </p>
      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.div
          key={question?.id ?? "declaracion"}
          custom={dir}
          variants={{
            enter: (d: number) => ({ x: `${14 * d}%`, opacity: 0 }),
            center: { x: 0, opacity: 1, transition: { duration: 0.75, ease: EASING.enter } },
            exit: (d: number) => ({ x: -50 * d, opacity: 0, transition: { duration: 0.28, ease: EASING.exit } }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {question ? (
            <QuestionScreen
              question={question}
              stored={stored[question.id]}
              onAnswer={async (answer, detail) => {
                await actions.saveAnswer(assessment, question.id, answer, detail, index + 1);
                go(index + 1);
              }}
            />
          ) : (
            <DeclarationScreen
              onBack={() => go(Math.max(visible.length - 1, 0))}
              onSubmit={async (name) => {
                onSubmitted();
                await actions.submit(assessment, name);
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function Submitted({ cycleId, practice, onAgain }: { cycleId: string; practice: boolean; onAgain: () => void }) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="a-eyebrow">Autoevaluación {cycleId.replace("-practica", "")}</p>
        {practice ? <PracticeBadge /> : null}
      </div>
      <motion.div className="grain relative flex flex-col items-start gap-4 overflow-hidden rounded-card bg-olive-800 p-5 text-cream" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={T.reveal}>
        <motion.span className="relative z-[2] grid size-14 place-items-center rounded-full bg-rose-500 text-olive-900" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.9, ease: [0.34, 1.7, 0.64, 1], delay: 0.2 }}>
          <Icon name="check" size="1.7rem" />
        </motion.span>
        <MaskWords as="h1" text="Autoevaluación enviada" emphasis={["enviada"]} className="relative z-[2] font-display text-[2.15rem] leading-[1.02] tracking-[-0.035em] [&_em]:text-rose-300 [&_em]:[font-variation-settings:var(--fv-accent)]" delay={0.1} />
        <p role="status" className="relative z-[2] text-app-small text-olive-300">
          Quedó guardada en su teléfono y se enviará cuando haya señal.
        </p>
      </motion.div>
      <ButtonLink href={practice ? "/app/diagnostico?practica=1" : "/app/diagnostico"} icon={<Icon name="arrow" />}>
        Ver mi diagnóstico
      </ButtonLink>
      {DEMO_OPEN ? (
        practice ? (
          <Button variant="ghost" onClick={onAgain} icon={<Icon name="route" />}>
            Responder de nuevo (demo)
          </Button>
        ) : (
          <ButtonLink href={PRACTICE_HREF} variant="ghost" icon={<Icon name="route" />}>
            Responder de nuevo (demo)
          </ButtonLink>
        )
      ) : null}
      {DEMO_OPEN ? <p className="text-app-caption text-ink-soft">La demo abre un borrador de práctica: su diagnóstico del ciclo no cambia.</p> : null}
    </section>
  );
}

/** Ruta /app/autoevaluacion: elige ciclo real o práctica (?nueva=1) y remonta al cambiar. */
export function AssessmentRoute() {
  const params = useSearchParams();
  const practice = DEMO_OPEN && params.get("nueva") === "1";
  return <AssessmentFlow key={practice ? "practica" : "ciclo"} practice={practice} />;
}

export function AssessmentFlow({ practice = false }: { practice?: boolean }) {
  const state = useAssessment({ practice });
  const actions = useAssessmentActions();
  const router = useRouter();
  // Entre "Enviar" y el diagnóstico: pantalla "Analizando" (§9.4).
  const [analyzing, setAnalyzing] = useState(false);
  const finish = useCallback(() => router.push(practice ? "/app/diagnostico?practica=1" : "/app/diagnostico"), [router, practice]);
  // Práctica: al llegar con una práctica ya enviada, se descarta para empezar de cero.
  const [arrived, setArrived] = useState(!practice);
  const [discarding, setDiscarding] = useState(false);

  useEffect(() => {
    if (arrived || state.status === "loading") return;
    setArrived(true);
    if (state.status === "ready" && state.assessment?.status === "submitted") {
      setDiscarding(true);
      void actions.discardPractice(state.assessment).finally(() => setDiscarding(false));
    }
  }, [arrived, state, actions]);

  if (analyzing) return <Analyzing axes={BANK.axes.map((a) => a.name)} onDone={finish} />;
  if (state.status === "loading" || discarding || !arrived) return <LoadingQuestion />;
  if (state.status === "no-profile") {
    return (
      <section className="flex flex-col gap-5">
        <p className="a-eyebrow">Autoevaluación</p>
        <MaskWords text="Primero complete su ficha" emphasis={["ficha"]} className="a-title" />
        <p className="text-app-body">Las preguntas dependen de su categoría. Complete la ficha y vuelva aquí.</p>
        <ButtonLink href="/app/ficha" icon={<Icon name="arrow" />}>
          Ir a mi ficha
        </ButtonLink>
      </section>
    );
  }

  const { profile, cycleId, assessment, answers } = state;
  if (!assessment) {
    const prefilled = prefilledAnswers(BANK, profile);
    const total = visibleQuestions(BANK, profile, prefilled).length;
    return <Intro total={total} practice={practice} onStart={() => void actions.start(cycleId, profile, prefilled)} />;
  }
  if (assessment.status === "submitted") {
    return <Submitted cycleId={cycleId} practice={practice} onAgain={() => void actions.discardPractice(assessment)} />;
  }
  return <InProgress key={assessment.id} assessment={assessment} profile={profile} stored={answers} practice={practice} onSubmitted={() => setAnalyzing(true)} />;
}
