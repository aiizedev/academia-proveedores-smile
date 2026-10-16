"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import type { IconName } from "@/components/icons";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/motion";
import { ButtonLink, Card, Chip, ChecklistItem, Confetti, GuideHero, Steps, Tip, Toast } from "@/components/ui";
import { goalProgress } from "@/domain/improvement/plan";
import { T } from "@/design/motion-react";
import { formatDate } from "@/lib/format";
import { BANK } from "./hooks";
import { GUIDES, useLocalPlan, useToggleCheck } from "./plan";

/* /app/plan/[metaId] · HU-IMP-02/03: guía completa sin conexión y checklist
   que completa la meta (toast "Meta completa" + confeti de 50 hojas). */
const AXIS_NAMES = Object.fromEntries(BANK.axes.map((a) => [a.code, a.name]));
const AXIS_ICON: Record<string, IconName> = { bpa: "bpa", residuos: "residuos", carbono: "carbono", infantil: "infantil", ddhh: "ddhh" };

const sectionTitle = "text-[0.72rem] font-extrabold uppercase tracking-[var(--tracking-caps)] text-olive-600";

export function GuideScreen({ axis }: { axis: string }) {
  const plan = useLocalPlan();
  const toggle = useToggleCheck();
  const [toast, setToast] = useState<string | null>(null);
  const [party, setParty] = useState(0);
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
    if (value && goalProgress(guide, next).complete) {
      setToast("Meta completa");
      setParty((n) => n + 1);
    }
  };

  return (
    <article className="flex flex-col gap-7">
      <GuideHero
        eyebrow={AXIS_NAMES[axis] ?? axis}
        title={guide.title}
        minutes={guide.minutes}
        icon={AXIS_ICON[axis] ?? "book"}
        backHref="/app/plan"
        chips={goal ? [`Meta ${goal.position} de 3`] : []}
      />
      <Reveal>
        <p className="text-[1.05rem] leading-[1.5]">{guide.intro}</p>
      </Reveal>

      {goal ? (
        <Reveal>
          <Card className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Chip priority={progress.complete ? "completa" : goal.priority} />
              <span className="text-app-small font-bold">Meta {goal.position} de 3</span>
            </div>
            <dl className="grid gap-3 text-app-body">
              <div><dt className="text-app-caption text-ink-soft">Hallazgo</dt><dd>{goal.finding}</dd></div>
              <div><dt className="text-app-caption text-ink-soft">Acción</dt><dd className="font-bold">{goal.action}</dd></div>
              <div className="grid grid-cols-2 gap-2">
                <div><dt className="text-app-caption text-ink-soft">Responsable</dt><dd>{goal.owner}</dd></div>
                <div><dt className="text-app-caption text-ink-soft">Fecha límite</dt><dd className="flex items-center gap-1"><Icon name="calendar" size="0.95rem" />{formatDate(`${goal.dueOn}T12:00:00-05:00`)}</dd></div>
              </div>
              <div><dt className="text-app-caption text-ink-soft">Evidencia</dt><dd>{goal.expectedEvidence}</dd></div>
            </dl>
          </Card>
        </Reveal>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className={sectionTitle}>Paso a paso</h2>
        <Steps steps={guide.steps} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className={sectionTitle}>Su checklist</h2>
          <motion.span key={progress.done} className="text-app-small font-bold tabular-nums" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 12 }}>
            {progress.done} de {progress.total}
          </motion.span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-pill bg-olive-100">
          <motion.div className="h-full rounded-pill bg-olive-600" animate={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} transition={T.reveal} />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {progress.complete ? (
            <motion.p key="ok" className="flex items-center gap-2 text-app-small font-bold text-olive-700" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Icon name="star" size="1rem" /> Meta completa
            </motion.p>
          ) : goal ? (
            <motion.p key="wip" className="text-app-small text-ink-soft" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              En progreso: marque lo que ya hizo.
            </motion.p>
          ) : null}
        </AnimatePresence>
        <div className="flex flex-col gap-[0.55rem]">
          {guide.checklist.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...T.enter, delay: i * 0.05 }}>
              <ChecklistItem checked={checked.has(item.id)} disabled={!goalKey} onChange={(e) => void onToggle(item.id, e.target.checked)}>
                {item.text}
              </ChecklistItem>
            </motion.div>
          ))}
        </div>
      </section>

      <Reveal>
        <Tip>{guide.tip}</Tip>
      </Reveal>
      <p className="text-[0.74rem] leading-[1.45] text-ink-soft">Fuente: {guide.source}</p>
      <ButtonLink href="/app/plan" variant="ghost" icon={<Icon name="back" />}>
        Volver a mis metas
      </ButtonLink>
      {party ? <Confetti key={party} count={50} seed={party} /> : null}
      {toast ? <Toast message={toast} icon="star" onDone={clearToast} /> : null}
    </article>
  );
}
