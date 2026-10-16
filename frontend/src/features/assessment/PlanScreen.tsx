"use client";

import { motion } from "framer-motion";
import type { IconName } from "@/components/icons";
import { Icon } from "@/components/icons";
import { MaskWords, Skeleton } from "@/components/motion";
import { ButtonLink, GoalCard } from "@/components/ui";
import { goalProgress } from "@/domain/improvement/plan";
import { T } from "@/design/motion-react";
import { BANK } from "./hooks";
import { useLocalPlan } from "./plan";

/* /app/plan · HU-IMP-01: 3 metas en orden de prioridad; la primera invertida. */
const AXIS_NAMES = Object.fromEntries(BANK.axes.map((a) => [a.code, a.name]));
const AXIS_ICON: Record<string, IconName> = { bpa: "bpa", residuos: "residuos", carbono: "carbono", infantil: "infantil", ddhh: "ddhh" };

export function PlanScreen() {
  const plan = useLocalPlan();

  if (plan.status === "loading") {
    return (
      <div className="flex flex-col gap-3 pt-2" aria-busy="true">
        <Skeleton className="h-4 w-24" rounded="var(--radius-pill)" />
        <Skeleton className="h-10 w-48" rounded="var(--radius-m)" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }
  if (plan.status === "empty") {
    return (
      <section className="flex flex-col gap-5">
        <p className="a-eyebrow">Su ruta</p>
        <MaskWords text="Aún no tiene metas" emphasis={["metas"]} className="a-title" />
        <p className="text-app-body">Al enviar la autoevaluación le proponemos 3 metas para empezar.</p>
        <ButtonLink href="/app/autoevaluacion" icon={<Icon name="arrow" />}>
          Ir a la autoevaluación
        </ButtonLink>
      </section>
    );
  }

  const progress = plan.goals.map((g) => goalProgress(g.guide, plan.checked[plan.goalKey(g.axis)] ?? new Set()));
  const done = progress.reduce((s, p) => s + p.done, 0);
  const total = progress.reduce((s, p) => s + p.total, 0);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <motion.p className="a-eyebrow" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={T.enter}>
          Su ruta · ciclo {plan.cycleId}
        </motion.p>
        <MaskWords text="Sus 3 metas" emphasis={["metas"]} className="a-title" />
        <p className="text-app-body text-ink-soft">Empiece por la primera. Cada guía funciona sin conexión.</p>
      </div>
      <motion.div className="flex items-center gap-3 rounded-button border border-line bg-white p-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...T.enter, delay: 0.2 }}>
        <span className="font-display text-[1.6rem] leading-none tabular-nums">
          {done}
          <span className="text-app-small text-ink-soft">/{total}</span>
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-pill bg-olive-100">
          <motion.div className="h-full rounded-pill bg-[image:var(--grad-progress)]" initial={{ width: 0 }} animate={{ width: `${total ? (done / total) * 100 : 0}%` }} transition={{ ...T.bar, delay: 0.3 }} />
        </div>
        <span className="text-app-caption font-bold text-ink-soft">tareas hechas</span>
      </motion.div>
      <div className="flex flex-col gap-3">
        {plan.goals.map((goal, i) => (
          <motion.div key={goal.axis} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ ...T.reveal, delay: 0.15 + i * 0.09 }}>
            <GoalCard
              href={`/app/plan/${goal.axis}`}
              priority={goal.priority}
              minutes={goal.guide.minutes}
              title={goal.guide.title}
              axisName={AXIS_NAMES[goal.axis] ?? goal.axis}
              done={progress[i]!.done}
              total={progress[i]!.total}
              icon={AXIS_ICON[goal.axis] ?? "book"}
              top={i === 0}
              index={i}
            />
          </motion.div>
        ))}
      </div>
      <ButtonLink href="/app/ficha/resumen" variant="ghost" icon={<Icon name="print" />}>
        Compartir mi ficha resumen
      </ButtonLink>
    </section>
  );
}
