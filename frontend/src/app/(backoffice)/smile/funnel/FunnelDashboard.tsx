"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BarList, ChartCard, ColumnChart, FunnelChart, Legend, ORDINAL, StackedBars, StatTile } from "@/components/charts";
import { Icon } from "@/components/icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { T } from "@/design/motion-react";
import { CYCLE_ORDER, STAGES, STAGE_DAYS, type Stage } from "@/mocks/smile";
import { advanced, funnelStages, rowsAt, stageCountsAt } from "../_ui/data";
import { FilterBar, useFilters } from "../_ui/filters";
import { useArrival } from "../_ui/hooks";
import { DashboardSkeleton, EmptyState, SegmentBadge } from "../_ui/kit";

const SHORT: Record<Stage, string> = { E1: "Registro", E2: "Diagnóstico", E3: "Plan", E4: "Adopción", E5: "Candidato", E6: "Preferente" };

export function FunnelDashboard() {
  const { filters, reset } = useFilters();
  const arrived = useArrival();
  const [stage, setStage] = useState<Stage | null>(null);
  const rows = useMemo(() => rowsAt(filters), [filters]);
  const stages = useMemo(() => funnelStages(filters), [filters]);
  const moved = useMemo(() => advanced(filters), [filters]);
  const total = rows.length;
  const reached = stages.map((s, i) => ({ ...s, n: stages.slice(i).reduce((a, x) => a + x.count, 0) }));
  const conv = reached.map((s, i) => {
    const prev = reached[i - 1];
    return { ...s, rate: prev && prev.n ? Math.round((s.n / prev.n) * 100) : 100 };
  });
  const upTo = CYCLE_ORDER.slice(0, CYCLE_ORDER.indexOf(filters.cycle) + 1);
  const evolution = upTo.map((c) => {
    const counts = stageCountsAt(filters, c);
    return { id: c, label: c, segments: STAGES.map((st, i) => ({ id: st.code, label: `${st.code} · ${st.name}`, value: counts[st.code], color: ORDINAL[i] ?? "var(--chart-series)" })) };
  });
  const daysToE5 = STAGE_DAYS.E1 + STAGE_DAYS.E2 + STAGE_DAYS.E3 + STAGE_DAYS.E4;
  const inStage = rows.filter((r) => r.c.stage === stage);

  if (!arrived) return (<><FilterBar /><DashboardSkeleton /></>);

  return (
    <>
      <FilterBar count={total} />
      {total === 0 ? (
        <EmptyState title="El camino aún no empieza aquí" body="No hay proveedores con estos filtros. Limpie los filtros para ver el funnel de la red." action={<button type="button" onClick={reset} className="mt-2 rounded-[var(--radius-pill)] bg-olive-800 px-5 py-2.5 text-app-small font-bold text-cream">Limpiar filtros</button>} />
      ) : (
        <div className="grid gap-6">
          <Stagger className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StaggerItem className="[&>article]:h-full"><StatTile tone="strong" label="Candidatos y preferentes" value={(stages[4]?.count ?? 0) + (stages[5]?.count ?? 0)} icon={<Icon name="check" size={18} />} /></StaggerItem>
            <StaggerItem className="[&>article]:h-full"><StatTile label="Avanzaron de etapa en el ciclo" value={moved} icon={<Icon name="arrow" size={18} />} /></StaggerItem>
            <StaggerItem className="[&>article]:h-full"><StatTile label="Llegan al menos a E4" value={total ? Math.round(((reached[3]?.n ?? 0) / total) * 100) : 0} format={(n) => `${Math.round(n)} %`} icon={<Icon name="route" size={18} />} /></StaggerItem>
            <StaggerItem className="[&>article]:h-full"><StatTile label="Días medios hasta E5" value={daysToE5} format={(n) => `${Math.round(n)} días`} icon={<Icon name="book" size={18} />} /></StaggerItem>
          </Stagger>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <Reveal>
              <ChartCard
                title="Proveedores por etapa"
                subtitle="Rampa de un solo tono: más oscuro, más maduro. Clic en una etapa para ver quiénes son."
                table={{ columns: [{ key: "e", label: "Etapa" }, { key: "n", label: "Proveedores", numeric: true }, { key: "h", label: "Criterio" }], rows: stages.map((s, i) => ({ e: `${s.short} · ${s.label}`, n: s.count, h: STAGES[i]?.hint ?? "" })) }}
              >
                <FunnelChart note="share" stages={stages} selected={stage} onSelect={(id) => setStage(id as Stage | null)} />
                <AnimatePresence initial={false}>
                  {stage ? (
                    <motion.div key={stage} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0, transition: T.exit }} transition={T.enter} className="overflow-hidden">
                      <div className="mt-4 rounded-[var(--radius-control)] bg-cream p-4">
                        <p className="text-app-caption font-bold text-ink-soft">{STAGES.find((s) => s.code === stage)?.hint}</p>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {inStage.map((r) => (
                            <li key={r.s.id}>
                              <Link href={`/smile/proveedores/${r.s.id}`} className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-line bg-white py-1 pr-3 pl-1 text-app-caption font-bold hover:border-olive-600">
                                <SegmentBadge segment={r.s.segment} />
                                {r.s.farm}
                              </Link>
                            </li>
                          ))}
                          {inStage.length === 0 ? <li className="text-app-small text-ink-soft">Nadie en esta etapa con estos filtros.</li> : null}
                        </ul>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </ChartCard>
            </Reveal>
            <div className="grid gap-6">
              <Reveal delay={0.06}>
                <ChartCard
                  title="Conversión entre etapas"
                  subtitle="Proveedores que alcanzaron al menos cada etapa."
                  table={{ columns: [{ key: "e", label: "Etapa" }, { key: "n", label: "≥ etapa", numeric: true }, { key: "r", label: "Pasa desde la anterior", numeric: true }], rows: conv.map((c) => ({ e: c.short, n: c.n, r: `${c.rate} %` })) }}
                >
                  <ColumnChart ordinal height={200} data={conv.map((c) => ({ id: c.id, label: c.short, value: c.n, display: String(c.n), hint: `alcanzan ${c.short} · ${c.rate} % pasa` }))} />
                  <ol className="mt-3 grid grid-cols-6 gap-1 text-center text-app-caption text-ink-soft">
                    {conv.map((c, i) => (
                      <li key={c.id} style={{ fontVariantNumeric: "tabular-nums" }}>{i === 0 ? "inicio" : `${c.rate} %`}</li>
                    ))}
                  </ol>
                </ChartCard>
              </Reveal>
              <Reveal delay={0.12}>
                <ChartCard title="Tiempo medio por etapa" subtitle="Días que un proveedor permanece en cada etapa (simulado)." table={{ columns: [{ key: "e", label: "Etapa" }, { key: "d", label: "Días", numeric: true }], rows: STAGES.slice(0, 5).map((s) => ({ e: `${s.code} · ${s.name}`, d: STAGE_DAYS[s.code] })) }}>
                  <BarList data={STAGES.slice(0, 5).map((s) => ({ id: s.code, label: `${s.code} · ${SHORT[s.code]}`, value: STAGE_DAYS[s.code], display: `${STAGE_DAYS[s.code]} d`, highlight: s.code === "E4", hint: "días promedio" }))} />
                </ChartCard>
              </Reveal>
            </div>
          </div>

          <Reveal>
            <ChartCard
              title="Evolución por ciclo"
              subtitle="Composición del funnel en cada cuatrimestre hasta el ciclo elegido."
              legend={<Legend items={STAGES.map((s, i) => ({ label: s.code, color: ORDINAL[i] ?? "var(--chart-series)" }))} />}
              table={{ columns: [{ key: "c", label: "Ciclo" }, ...STAGES.map((s) => ({ key: s.code, label: s.code, numeric: true }))], rows: evolution.map((e) => ({ c: e.label, ...Object.fromEntries(e.segments.map((s) => [s.id, s.value])) })) }}
            >
              <StackedBars rows={evolution} unit="proveedores" />
            </ChartCard>
          </Reveal>
        </div>
      )}
    </>
  );
}
