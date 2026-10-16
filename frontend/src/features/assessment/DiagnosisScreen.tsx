"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Icon, type IconName } from "@/components/icons";
import { MaskWords, Skeleton, SkeletonText } from "@/components/motion";
import { AxisRow, ButtonLink, Chip, Confetti, CriticalAlert, LevelBadge, ScoreRing, type Level } from "@/components/ui";
import { diagnose, URGENT_ALERT } from "@/domain/assessment/diagnosis";
import { EASING, T } from "@/design/motion-react";
import { DEMO_OPEN } from "@/lib/env";
import { cn } from "@/lib/cn";
import { BANK, useAssessment } from "./hooks";

/* CU-06 · HU-ASM-05. Diagnóstico calculado en el teléfono sobre la
   autoevaluación enviada (RF-ASM-013); el oficial lo reemplaza al sincronizar.
   Movimiento (§9.4): anillo 2.2 s + número que cuenta, barras escalonadas,
   insignia con impulso y confeti de hojas si el nivel es Avanzado. */
const AXIS = Object.fromEntries(BANK.axes.map((a) => [a.code, a]));
const AXIS_ICON: Record<string, IconName> = { bpa: "bpa", residuos: "residuos", carbono: "carbono", infantil: "infantil", ddhh: "ddhh" };
const LEVELS: Array<[Level, string]> = [
  ["inicial", "Inicial"],
  ["desarrollo", "En desarrollo"],
  ["avanzado", "Avanzado"],
];

const linkClass = "inline-flex min-h-12 items-center font-bold text-olive-800 underline underline-offset-4";

function DiagnosisSkeleton() {
  return (
    <div className="flex flex-col items-center gap-5 pt-4" aria-busy="true">
      <Skeleton className="size-[13.2rem]" rounded="50%" />
      <Skeleton className="h-9 w-40" rounded="var(--radius-pill)" />
      <div className="w-full">
        <SkeletonText lines={2} />
      </div>
      <Skeleton className="h-36 w-full" />
    </div>
  );
}

export function DiagnosisRoute() {
  const params = useSearchParams();
  const practice = DEMO_OPEN && params.get("practica") === "1";
  return <DiagnosisScreen key={practice ? "practica" : "ciclo"} practice={practice} />;
}

export function DiagnosisScreen({ practice = false }: { practice?: boolean }) {
  const state = useAssessment({ practice });
  const diagnosis = useMemo(() => {
    if (state.status !== "ready" || state.assessment?.status !== "submitted") return null;
    const answers = Object.fromEntries(Object.entries(state.answers).map(([id, s]) => [id, s.answer]));
    return diagnose(BANK, state.profile, answers);
  }, [state]);

  if (state.status === "loading") return <DiagnosisSkeleton />;
  if (!diagnosis || diagnosis.pillar1 === null || diagnosis.level === null) {
    return (
      <section className="flex flex-col gap-5">
        <p className="a-eyebrow">Diagnóstico</p>
        <MaskWords text="Aún no tiene diagnóstico" emphasis={["diagnóstico"]} className="a-title" />
        <p className="text-app-body">Responda la autoevaluación y aquí verá su puntaje y por dónde empezar.</p>
        <ButtonLink href={practice ? "/app/autoevaluacion?nueva=1" : "/app/autoevaluacion"} icon={<Icon name="arrow" />}>
          Ir a la autoevaluación
        </ButtonLink>
      </section>
    );
  }

  const { pillar1, level, axes, alerts, bpaProximity, nextStep } = diagnosis;
  const levelIndex = LEVELS.findIndex(([l]) => l === level);
  const axisEntries = Object.entries(axes).filter(([, a]) => a.score !== null && a.level !== null);

  return (
    <section className="flex flex-col gap-6">
      {level === "avanzado" ? <Confetti count={60} delay={1.2} /> : null}
      <div className="relative -mx-[var(--screen-x)] flex flex-col items-center gap-3 px-[var(--screen-x)] pb-2 text-center">
        <div className="flex items-center gap-2">
          <motion.p className="a-eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={T.enter}>
            Su diagnóstico
          </motion.p>
          {practice ? (
            <span className="rounded-pill bg-rose-100 px-[0.6rem] py-[0.2rem] text-app-chip font-extrabold uppercase tracking-[var(--tracking-chip)] text-rose-700">Práctica</span>
          ) : null}
        </div>
        <ScoreRing score={pillar1} />
        <LevelBadge level={level} pop />
        <div className="mt-1 grid w-full grid-cols-3 gap-1" aria-hidden>
          {LEVELS.map(([l, label], i) => (
            <motion.span
              key={l}
              className={cn("border-t-4 pt-2 text-left text-[0.66rem] font-bold", i === levelIndex ? "border-olive-800 text-ink" : "border-olive-100 text-ink-soft")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...T.enter, delay: 1.2 + i * 0.08 }}
            >
              {label}
            </motion.span>
          ))}
        </div>
        {bpaProximity !== null ? (
          <motion.p className="mt-2 font-display text-[1.2rem] leading-[1.15] tracking-[-0.02em]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...T.enter, delay: 1.4 }}>
            Está a <em className="text-rose-700 [font-variation-settings:var(--fv-accent)]">{Math.round(bpaProximity)} %</em> de la certificación BPA del ICA.
          </motion.p>
        ) : null}
        <p className="text-app-caption text-ink-soft">Calculado en su teléfono. Se confirmará cuando haya señal.</p>
      </div>

      {alerts.map((alert) => (
        <CriticalAlert key={alert.questionId} title={URGENT_ALERT} action={<Link href="/app/plan" className={linkClass}>Ver la guía de {AXIS[alert.axis]?.name ?? alert.axis}</Link>}>
          {alert.message}
        </CriticalAlert>
      ))}

      {nextStep ? (
        <motion.div initial={{ opacity: 0, y: 40, rotate: 1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 1.1, ease: EASING.enter, delay: 0.9 }}>
          <Link href="/app/plan" className="grain group relative grid grid-cols-[1fr_auto] gap-[0.9rem] overflow-hidden rounded-card bg-olive-800 p-[1.1rem] text-cream transition-shadow duration-[var(--dur-m)] hover:shadow-lift">
            <div className="relative z-[2] flex flex-col gap-2">
              <p className="text-app-eyebrow font-black uppercase tracking-[var(--tracking-caps)] text-rose-500">Su siguiente paso</p>
              <div className="flex flex-wrap items-center gap-2">
                <Chip priority={nextStep.priority} onDark />
                <span className="text-app-small font-bold text-olive-300">{AXIS[nextStep.axis]?.name}</span>
              </div>
            </div>
            <span className="relative z-[2] row-span-2 grid size-[3.2rem] place-items-center self-start rounded-full bg-rose-500 text-olive-900 transition-[rotate] duration-[var(--dur-m)] group-hover:-rotate-12">
              <Icon name={AXIS_ICON[nextStep.axis] ?? "book"} size="1.6rem" />
            </span>
            <p className="relative z-[2] font-display text-[1.3rem] leading-[1.12] tracking-[-0.02em]">{nextStep.nextStep}</p>
            <span className="relative z-[2] col-span-2 inline-flex items-center gap-2 font-bold text-rose-300">
              Ver mi plan de 3 metas
              <span className="transition-[translate] duration-[var(--dur-m)] group-hover:translate-x-1">
                <Icon name="arrow" size="1rem" />
              </span>
            </span>
          </Link>
        </motion.div>
      ) : null}

      <div className="flex flex-col gap-3">
        <h2 className="text-[0.72rem] font-extrabold uppercase tracking-[var(--tracking-caps)] text-olive-600">Por eje</h2>
        <ul className="flex flex-col gap-[0.6rem]">
          {axisEntries.map(([code, axis], i) => (
            <AxisRow key={code} index={i} icon={AXIS_ICON[code] ?? "chart"} name={AXIS[code]?.name ?? code} score={axis.score!} level={axis.level!} />
          ))}
        </ul>
      </div>

      <ButtonLink href="/app/plan" icon={<Icon name="arrow" />}>
        Ver mi plan
      </ButtonLink>
      {DEMO_OPEN ? (
        <ButtonLink href="/app/autoevaluacion?nueva=1" variant="ghost" icon={<Icon name="route" />}>
          Responder de nuevo (demo)
        </ButtonLink>
      ) : null}
    </section>
  );
}
