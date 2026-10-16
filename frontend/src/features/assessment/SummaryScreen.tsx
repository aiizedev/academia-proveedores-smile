"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui";
import { DEPARTMENTS, MUNICIPALITIES } from "@/data/catalog/local";
import { useLocalDb } from "@/data/db/context";
import type { SupplierProfileRecord } from "@/data/db/models";
import type { LevelId } from "@/domain/assessment/scoring";
import { summaryText, whatsappLink } from "@/domain/improvement/summary";
import { BANK } from "./hooks";
import { useLocalPlan } from "./plan";

/* /app/ficha/resumen · HU-IMP-04 (CU-08): ficha A4 para imprimir en blanco y
   negro y texto < 1 KB para WhatsApp; las dos funcionan sin conexión. */
const AXIS_NAMES = Object.fromEntries(BANK.axes.map((a) => [a.code, a.name]));
const LEVEL: Record<LevelId, string> = { inicial: "Inicial", desarrollo: "En desarrollo", avanzado: "Avanzado" };

function useFarm(): { name: string; place: string } | null {
  const db = useLocalDb();
  const [farm, setFarm] = useState<{ name: string; place: string } | null>(null);
  useEffect(() => {
    if (db.status !== "ready") return;
    const sub = db.database
      .get<SupplierProfileRecord>("supplier_profile")
      .query()
      .observe()
      .subscribe(([row]) => {
        if (!row) return setFarm(null);
        const p = row.toProfile();
        const place = [MUNICIPALITIES.find((m) => m.code === p.municipalityCode)?.name, DEPARTMENTS.find((d) => d.code === p.departmentCode)?.name]
          .filter(Boolean)
          .join(", ");
        setFarm({ name: p.legalName, place: p.vereda ? `${p.vereda} · ${place}` : place });
      });
    return () => sub.unsubscribe();
  }, [db]);
  return farm;
}

export function SummaryScreen() {
  const plan = useLocalPlan();
  const farm = useFarm();

  if (plan.status === "loading") return <p className="text-app-body text-ink-soft">Preparando su ficha…</p>;
  if (plan.status === "empty" || !farm || plan.diagnosis.pillar1 === null || plan.diagnosis.level === null) {
    return (
      <section className="flex flex-col gap-4">
        <p className="a-eyebrow">Ficha resumen</p>
        <h1 className="a-title">Aún no hay ficha para compartir</h1>
        <p className="text-app-body">Complete su ficha y envíe la autoevaluación para generarla.</p>
      </section>
    );
  }

  const { diagnosis, goals, cycleId } = plan;
  const score = diagnosis.pillar1!;
  const level = diagnosis.level!;
  const text = summaryText({
    farmName: farm.name,
    place: farm.place,
    cycleId,
    score,
    levelLabel: LEVEL[level],
    goals: goals.map((g) => ({ axisName: AXIS_NAMES[g.axis] ?? g.axis, action: g.action })),
  });

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 print:hidden">
        <p className="a-eyebrow">Ficha resumen</p>
        <h1 className="a-title">
          Comparta su <em>avance</em>
        </h1>
      </div>

      <article className="overflow-hidden rounded-dock border border-line bg-white print:max-w-[170mm] print:rounded-none print:border-ink print:text-[11pt]">
        <header className="grain flex flex-col gap-1 bg-olive-800 px-5 py-4 text-cream print:bg-white print:text-ink print:[&::after]:hidden">
          <p className="brand text-app-h3">
            smile<span className="dot print:text-ink">.</span>
          </p>
          <h2 className="font-display text-app-title leading-[var(--lh-heading)]">{farm.name}</h2>
          <p className="text-app-small text-olive-300 print:text-ink">
            {farm.place} · Autoevaluación {cycleId}
          </p>
        </header>
        <div className="flex flex-col gap-5 p-5">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-[length:var(--fs-app-score)] leading-none tabular-nums">{Math.round(score)}</span>
            <span className="text-app-body">
              de 100 · <strong>{LEVEL[level]}</strong>
            </span>
          </div>
          <table className="w-full text-left text-app-body">
            <thead>
              <tr className="border-b border-line print:border-ink">
                <th className="py-2 font-bold">Eje</th>
                <th className="py-2 text-right font-bold">Puntaje</th>
                <th className="py-2 text-right font-bold">Nivel</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(diagnosis.axes).map(([code, a]) =>
                a.score !== null && a.level !== null ? (
                  <tr key={code} className="border-b border-line-light print:border-ink">
                    <td className="py-2">{AXIS_NAMES[code]}</td>
                    <td className="py-2 text-right tabular-nums">{Math.round(a.score)} %</td>
                    <td className="py-2 text-right">{LEVEL[a.level]}</td>
                  </tr>
                ) : null,
              )}
            </tbody>
          </table>
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-app-h3">Mis 3 metas</h3>
            <ol className="flex flex-col gap-3">
              {goals.map((g) => (
                <li key={g.axis} className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-rose-100 font-bold text-rose-700 print:border print:border-ink print:bg-white print:text-ink">
                    {g.position}
                  </span>
                  <div className="flex flex-col gap-0.5 text-app-body">
                    <p className="font-bold">{AXIS_NAMES[g.axis]}</p>
                    <p>{g.action}</p>
                    <p className="text-app-small text-ink-soft print:text-ink">Cómo se verifica: {g.expectedEvidence}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <footer className="bg-cream px-5 py-3 text-app-caption text-ink-soft print:bg-white print:text-ink">Academia de Proveedores Smile</footer>
      </article>

      <div className="flex flex-col gap-3 print:hidden">
        <Button onClick={() => window.print()} icon={<Icon name="doc" />}>
          Descargar o imprimir
        </Button>
        <a
          href={whatsappLink(text)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[3.7rem] items-center justify-center gap-3 rounded-button border-[1.5px] border-line px-[1.4rem] text-app-button font-extrabold text-ink"
        >
          Enviar por WhatsApp
          <Icon name="chat" size="1.3rem" />
        </a>
      </div>
    </section>
  );
}
