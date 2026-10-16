"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { IconName } from "@/components/icons";
import { AxisRow, Card, Chip, CriticalAlert, LevelBadge, ScoreRing } from "@/components/ui";
import { diagnose, URGENT_ALERT } from "@/domain/assessment/diagnosis";
import { BANK, useAssessment } from "./hooks";

/* CU-06 · HU-ASM-05. Diagnóstico calculado en el teléfono sobre la
   autoevaluación enviada (RF-ASM-013); el oficial lo reemplaza al sincronizar. */
const AXIS = Object.fromEntries(BANK.axes.map((a) => [a.code, a]));
const AXIS_ICON: Record<string, IconName> = { bpa: "bpa", residuos: "residuos", carbono: "carbono", infantil: "infantil", ddhh: "ddhh" };

const linkClass = "inline-flex min-h-12 items-center font-bold text-olive-800 underline underline-offset-4";

export function DiagnosisScreen() {
  const state = useAssessment();
  const diagnosis = useMemo(() => {
    if (state.status !== "ready" || state.assessment?.status !== "submitted") return null;
    const answers = Object.fromEntries(Object.entries(state.answers).map(([id, s]) => [id, s.answer]));
    return diagnose(BANK, state.profile, answers);
  }, [state]);

  if (state.status === "loading") return <p className="text-app-body text-ink-soft">Abriendo su diagnóstico…</p>;
  if (!diagnosis || diagnosis.pillar1 === null || diagnosis.level === null) {
    return (
      <section className="flex flex-col gap-5">
        <p className="a-eyebrow">Diagnóstico</p>
        <h1 className="a-title">Aún no tiene diagnóstico</h1>
        <p className="text-app-body">Responda la autoevaluación y aquí verá su puntaje y por dónde empezar.</p>
        <Link href="/app/autoevaluacion" className="inline-flex min-h-[3.7rem] items-center justify-center rounded-button bg-olive-800 px-[1.4rem] text-app-button font-extrabold text-cream">
          Ir a la autoevaluación
        </Link>
      </section>
    );
  }

  const { pillar1, level, axes, alerts, bpaProximity, nextStep } = diagnosis;
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="a-eyebrow">Su diagnóstico</p>
        <ScoreRing score={pillar1} />
        <LevelBadge level={level} />
        {bpaProximity !== null ? (
          <p className="text-app-body font-bold">Está a {Math.round(bpaProximity)} % de la certificación BPA del ICA.</p>
        ) : null}
        <p className="text-app-caption text-ink-soft">Calculado en su teléfono. Se confirmará cuando haya señal.</p>
      </div>

      {alerts.map((alert) => (
        <CriticalAlert key={alert.questionId} title={URGENT_ALERT} action={<Link href="/app/plan" className={linkClass}>Ver la guía de {AXIS[alert.axis]?.name ?? alert.axis}</Link>}>
          {alert.message}
        </CriticalAlert>
      ))}

      {nextStep ? (
        <Card strong className="flex flex-col gap-3">
          <p className="text-app-eyebrow font-black uppercase tracking-[var(--tracking-caps)] text-rose-500">Su siguiente paso</p>
          <div className="flex items-center gap-2">
            <Chip priority={nextStep.priority} />
            <span className="font-bold">{AXIS[nextStep.axis]?.name}</span>
          </div>
          <p className="font-display text-app-h3">{nextStep.nextStep}</p>
          <Link href="/app/plan" className="inline-flex min-h-12 items-center font-bold text-rose-500 underline underline-offset-4">
            Ver mi plan de 3 metas
          </Link>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-app-h3">Por eje</h2>
        <ul className="flex flex-col gap-4">
          {Object.entries(axes).map(([code, axis]) =>
            axis.score !== null && axis.level !== null ? (
              <AxisRow key={code} icon={AXIS_ICON[code] ?? "chart"} name={AXIS[code]?.name ?? code} score={axis.score} level={axis.level} />
            ) : null,
          )}
        </ul>
      </div>
    </section>
  );
}
