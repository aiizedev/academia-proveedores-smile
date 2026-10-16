"use client";

import Link from "next/link";
import { GoalCard } from "@/components/ui";
import { goalProgress } from "@/domain/improvement/plan";
import { BANK } from "./hooks";
import { useLocalPlan } from "./plan";

/* /app/plan · HU-IMP-01: 3 metas en orden de prioridad; la primera invertida. */
const AXIS_NAMES = Object.fromEntries(BANK.axes.map((a) => [a.code, a.name]));

export function PlanScreen() {
  const plan = useLocalPlan();

  if (plan.status === "loading") return <p className="text-app-body text-ink-soft">Abriendo su ruta…</p>;
  if (plan.status === "empty") {
    return (
      <section className="flex flex-col gap-5">
        <p className="a-eyebrow">Su ruta</p>
        <h1 className="a-title">Aún no tiene metas</h1>
        <p className="text-app-body">Al enviar la autoevaluación le proponemos 3 metas para empezar.</p>
        <Link href="/app/autoevaluacion" className="inline-flex min-h-[3.7rem] items-center justify-center rounded-button bg-olive-800 px-[1.4rem] text-app-button font-extrabold text-cream">
          Ir a la autoevaluación
        </Link>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="a-eyebrow">Su ruta</p>
        <h1 className="a-title">
          Sus 3 <em>metas</em>
        </h1>
        <p className="text-app-body text-ink-soft">Empiece por la primera. Cada guía funciona sin conexión.</p>
      </div>
      <div className="flex flex-col gap-3">
        {plan.goals.map((goal, i) => {
          const progress = goalProgress(goal.guide, plan.checked[plan.goalKey(goal.axis)] ?? new Set());
          return (
            <GoalCard
              key={goal.axis}
              href={`/app/plan/${goal.axis}`}
              priority={goal.priority}
              minutes={goal.guide.minutes}
              title={goal.guide.title}
              axisName={AXIS_NAMES[goal.axis] ?? goal.axis}
              done={progress.done}
              total={progress.total}
              top={i === 0}
            />
          );
        })}
      </div>
    </section>
  );
}
