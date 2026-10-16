"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Card, Chip, ChecklistItem, GuideHero, Steps, Tip, Toast } from "@/components/ui";
import { goalProgress } from "@/domain/improvement/plan";
import { formatDate } from "@/lib/format";
import { BANK } from "./hooks";
import { GUIDES, useLocalPlan, useToggleCheck } from "./plan";

/* /app/plan/[metaId] · HU-IMP-02/03: guía completa sin conexión y checklist
   que completa la meta (toast "Meta completa"). */
const AXIS_NAMES = Object.fromEntries(BANK.axes.map((a) => [a.code, a.name]));

export function GuideScreen({ axis }: { axis: string }) {
  const plan = useLocalPlan();
  const toggle = useToggleCheck();
  const [toast, setToast] = useState<string | null>(null);
  const clearToast = useCallback(() => setToast(null), []);

  const goal = plan.status === "ready" ? plan.goals.find((g) => g.axis === axis) : undefined;
  const guide = goal?.guide ?? GUIDES.find((g) => g.axis === axis);
  if (!guide) return <p className="text-app-body">No encontramos esta guía.</p>;

  const goalKey = plan.status === "ready" ? plan.goalKey(axis) : null;
  const checked = (goalKey && plan.status === "ready" ? plan.checked[goalKey] : undefined) ?? new Set<string>();
  const progress = goalProgress(guide, checked);

  const onToggle = async (itemId: string, value: boolean) => {
    if (!goalKey) return;
    const next = new Set(checked);
    if (value) next.add(itemId);
    else next.delete(itemId);
    await toggle(goalKey, itemId, value);
    if (value && goalProgress(guide, next).complete) setToast("Meta completa");
  };

  return (
    <article className="flex flex-col gap-6">
      <GuideHero eyebrow={AXIS_NAMES[axis] ?? axis} title={guide.title} minutes={guide.minutes} />
      <p className="text-app-body">{guide.intro}</p>

      {goal ? (
        <Card className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Chip priority={progress.complete ? "completa" : goal.priority} />
            <span className="text-app-small font-bold">Meta {goal.position} de 3</span>
          </div>
          <dl className="grid gap-2 text-app-body">
            <div><dt className="text-app-caption text-ink-soft">Hallazgo</dt><dd>{goal.finding}</dd></div>
            <div><dt className="text-app-caption text-ink-soft">Acción</dt><dd className="font-bold">{goal.action}</dd></div>
            <div className="grid grid-cols-2 gap-2">
              <div><dt className="text-app-caption text-ink-soft">Responsable</dt><dd>{goal.owner}</dd></div>
              <div><dt className="text-app-caption text-ink-soft">Fecha límite</dt><dd>{formatDate(`${goal.dueOn}T12:00:00-05:00`)}</dd></div>
            </div>
            <div><dt className="text-app-caption text-ink-soft">Evidencia</dt><dd>{goal.expectedEvidence}</dd></div>
          </dl>
        </Card>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-app-h3">Paso a paso</h2>
        <Steps steps={guide.steps} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-app-h3">Su checklist</h2>
          <span className="text-app-small font-bold tabular-nums">
            {progress.done} de {progress.total}
          </span>
        </div>
        {progress.complete ? <p className="text-app-small font-bold text-olive-700">Meta completa</p> : goal ? <p className="text-app-small text-ink-soft">En progreso</p> : null}
        <div className="flex flex-col gap-2">
          {guide.checklist.map((item) => (
            <ChecklistItem key={item.id} checked={checked.has(item.id)} disabled={!goalKey} onChange={(e) => void onToggle(item.id, e.target.checked)}>
              {item.text}
            </ChecklistItem>
          ))}
        </div>
      </section>

      <Tip>{guide.tip}</Tip>
      <p className="text-app-caption text-ink-soft">Fuente: {guide.source}</p>
      <Link href="/app/plan" className="inline-flex min-h-12 items-center font-bold text-olive-800 underline underline-offset-4">
        Volver a mis metas
      </Link>
      {toast ? <Toast message={toast} onDone={clearToast} /> : null}
    </article>
  );
}
