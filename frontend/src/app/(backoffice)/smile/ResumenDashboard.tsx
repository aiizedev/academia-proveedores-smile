"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BarList, ChartCard, FunnelChart, Legend, LineChart, RiskMatrix, StatTile, lineTable, type Point } from "@/components/charts";
import { Icon } from "@/components/icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { T } from "@/design/motion-react";
import { MONTHS, STAGES, WASTE_BASELINE, WASTE_TARGET, type Stage } from "@/mocks/smile";
import { VOLUME_MAX, cycleBand, fmtCopShort, fmtPct, funnelStages, kpiPanel, monthlyWaste, pareto, rowsAt } from "./_ui/data";
import { FilterBar, SegmentGlyph, useFilters } from "./_ui/filters";
import { useArrival } from "./_ui/hooks";
import { DashboardSkeleton, EmptyState, StageBadge } from "./_ui/kit";

export function ResumenDashboard() {
  const { filters, reset } = useFilters();
  const arrived = useArrival();
  const router = useRouter();
  const [stage, setStage] = useState<Stage | null>(null);

  const rows = useMemo(() => rowsAt(filters), [filters]);
  const k = useMemo(() => kpiPanel(filters), [filters]);
  const stages = useMemo(() => funnelStages(filters), [filters]);
  const waste = useMemo(() => monthlyWaste(filters), [filters]);
  const par = useMemo(() => pareto(filters), [filters]);

  const points: Point[] = rows.map((r) => ({
    id: r.s.id,
    label: r.s.farm,
    x: r.c.score,
    y: r.x.volumeKg,
    segment: r.s.segment,
    meta: `${r.s.municipality} · ${r.c.stage} · merma ${fmtPct(r.c.wastePct)}`,
  }));
  const inStage = rows.filter((r) => !stage || r.c.stage === stage).sort((a, b) => a.c.score - b.c.score);
  const band = cycleBand(filters);
  const delta = (a: number, b: number | undefined) => (b === undefined ? undefined : Math.round((a - b) * 10) / 10);

  if (!arrived) return (<><FilterBar /><DashboardSkeleton /></>);

  return (
    <>
      <FilterBar count={rows.length} />
      {rows.length === 0 ? (
        <EmptyState
          title="Todavía no hay proveedores aquí"
          body="Con estos filtros no encontramos proveedores en la Academia. Pruebe otro municipio o categoría: la red piloto es Fruver."
          action={
            <button type="button" onClick={reset} className="mt-2 rounded-[var(--radius-pill)] bg-olive-800 px-5 py-2.5 text-app-small font-bold text-cream">
              Limpiar filtros
            </button>
          }
        />
      ) : (
        <div className="grid gap-6">
          <Stagger className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StaggerItem className="[&>article]:h-full">
              <StatTile
                tone="strong"
                label="Proveedores activos"
                value={k.now.active}
                delta={k.prev && k.prev.active ? { value: k.now.active - k.prev.active, label: k.prevLabel } : undefined}
                trend={k.trend.map((t) => t.active)}
                icon={<Icon name="route" size={18} />}
              />
            </StaggerItem>
            <StaggerItem className="[&>article]:h-full">
              <StatTile
                label="Score medio"
                value={k.now.score}
                format={(n) => n.toLocaleString("es-CO", { maximumFractionDigits: 1 })}
                delta={k.prev && k.prev.active ? { value: delta(k.now.score, k.prev.score) ?? 0, label: k.prevLabel, unit: " pts" } : undefined}
                trend={k.trend.map((t) => t.score)}
                icon={<Icon name="chart" size={18} />}
              />
            </StaggerItem>
            <StaggerItem className="[&>article]:h-full">
              <StatTile
                label="Merma recibida"
                value={k.now.waste}
                format={(n) => fmtPct(Math.round(n * 10) / 10)}
                goodWhen="down"
                delta={k.prev && k.prev.active ? { value: delta(k.now.waste, k.prev.waste) ?? 0, label: k.prevLabel, unit: " pp" } : undefined}
                trend={k.trend.map((t) => t.waste)}
                icon={<Icon name="residuos" size={18} />}
              />
            </StaggerItem>
            <StaggerItem className="[&>article]:h-full">
              <StatTile
                label="Lotes con carencia verificada"
                value={k.now.carencia}
                format={(n) => fmtPct(Math.round(n * 10) / 10)}
                delta={k.prev && k.prev.active ? { value: delta(k.now.carencia, k.prev.carencia) ?? 0, label: k.prevLabel, unit: " pp" } : undefined}
                trend={k.trend.map((t) => t.carencia)}
                icon={<Icon name="bpa" size={18} />}
              />
            </StaggerItem>
          </Stagger>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <Reveal>
              <ChartCard
                title="Matriz de riesgo"
                subtitle="Score de sostenibilidad frente al volumen que Smile compra. Clic en un punto para abrir el expediente."
                legend={
                  <Legend
                    items={[
                      { label: "Estratégico", color: "var(--chart-highlight)", shape: "diamond" },
                      { label: "Local", color: "var(--chart-local)", shape: "circle" },
                    ]}
                  />
                }
                table={{
                  columns: [
                    { key: "p", label: "Proveedor" },
                    { key: "seg", label: "Segmento" },
                    { key: "x", label: "Score", numeric: true },
                    { key: "y", label: "kg/mes", numeric: true },
                  ],
                  rows: points.map((p) => ({ p: p.label, seg: p.segment === "ESTRATEGICO" ? "Estratégico" : "Local", x: p.x, y: p.y.toLocaleString("es-CO") })),
                }}
                actions={
                  <Link href="/smile/riesgo" className="rounded-[var(--radius-pill)] px-3 py-1.5 text-app-caption font-bold text-olive-700 hover:bg-cream-200">
                    Visor completo →
                  </Link>
                }
              >
                <RiskMatrix points={points} height={380} yMax={VOLUME_MAX} yScale="sqrt" onSelect={(id) => router.push(`/smile/proveedores/${id}`)} />
              </ChartCard>
            </Reveal>

            <Reveal delay={0.08}>
              <ChartCard
                title="Pareto del gasto"
                subtitle={`El 80 % del gasto del ciclo lo explican ${par.to80} de ${par.items.length} proveedores.`}
                legend={
                  <Legend
                    items={[
                      { label: "Estratégico", color: "var(--chart-highlight)" },
                      { label: "Local", color: "var(--chart-series)" },
                    ]}
                  />
                }
                table={{
                  columns: [
                    { key: "p", label: "Proveedor" },
                    { key: "g", label: "Gasto", numeric: true },
                    { key: "s", label: "% del gasto", numeric: true },
                    { key: "c", label: "% acumulado", numeric: true },
                  ],
                  rows: par.items.map((i) => ({ p: i.label, g: fmtCopShort(i.spend), s: fmtPct(i.share), c: fmtPct(i.cum) })),
                }}
              >
                <div className="mb-4 flex items-baseline gap-3 rounded-[var(--radius-control)] bg-rose-100 px-4 py-3">
                  <span className="whitespace-nowrap font-body text-[1.9rem] font-semibold leading-none tracking-[-0.02em]" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {fmtPct(par.strategicShare)}
                  </span>
                  <span className="text-app-small text-ink-soft">del gasto está en los proveedores estratégicos</span>
                </div>
                <BarList
                  data={par.items.slice(0, 8).map((i) => ({
                    id: i.id,
                    label: i.label,
                    value: i.share,
                    display: fmtPct(i.share),
                    highlight: i.segment === "ESTRATEGICO",
                    hint: `del gasto · acumulado ${fmtPct(i.cum)}`,
                  }))}
                  onSelect={(id) => router.push(`/smile/proveedores/${id}`)}
                />
              </ChartCard>
            </Reveal>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <Reveal>
              <ChartCard
                title="Funnel de maduración"
                subtitle="Clic en una etapa para ver quiénes están ahí."
                table={{
                  columns: [
                    { key: "e", label: "Etapa" },
                    { key: "n", label: "Proveedores", numeric: true },
                  ],
                  rows: stages.map((s) => ({ e: `${s.short} · ${s.label}`, n: s.count })),
                }}
              >
                <FunnelChart note="share" stages={stages} selected={stage} onSelect={(id) => setStage(id as Stage | null)} />
              </ChartCard>
            </Reveal>
            <Reveal delay={0.08}>
              <section className="flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-6">
                <header className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-[1.25rem] leading-tight tracking-[-0.02em]">
                      {stage ? `${stage} · ${STAGES.find((s) => s.code === stage)?.name}` : "Todos los proveedores"}
                    </h3>
                    <p className="mt-1 text-app-small text-ink-soft">
                      {inStage.length} proveedor{inStage.length === 1 ? "" : "es"} · primero los de menor score
                    </p>
                  </div>
                  {stage ? (
                    <button type="button" onClick={() => setStage(null)} className="rounded-[var(--radius-pill)] border border-line px-3 py-1.5 text-app-caption font-semibold text-ink-soft hover:bg-cream-200">
                      Ver todas
                    </button>
                  ) : null}
                </header>
                <ul className="relative -mx-2 max-h-[22rem] flex-1 overflow-y-auto pr-1">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {inStage.map((r, i) => (
                      <motion.li
                        key={r.s.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0, transition: { ...T.ui, delay: Math.min(i, 8) * 0.03 } }}
                        exit={{ opacity: 0, scale: 0.96, transition: T.exit }}
                      >
                        <Link href={`/smile/proveedores/${r.s.id}`} className="group flex items-center gap-3 rounded-[var(--radius-control)] px-2 py-2.5 transition-colors hover:bg-cream">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-olive-25 font-display text-[0.95rem] text-olive-800">{r.s.farm.split(" ").slice(-1)[0]?.[0]}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-app-small font-bold">{r.s.farm}</span>
                            <span className="block truncate text-app-caption text-ink-soft">{r.s.municipality} · {r.s.rep}</span>
                          </span>
                          <span title={r.s.segment === "ESTRATEGICO" ? "Estratégico" : "Local"} className="grid size-5 place-items-center">
                            <SegmentGlyph segment={r.s.segment} size={11} />
                            <span className="sr-only">{r.s.segment === "ESTRATEGICO" ? "Estratégico" : "Local"}</span>
                          </span>
                          <StageBadge stage={r.c.stage} />
                          <span className="w-10 text-right text-app-small font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>{r.c.score}</span>
                          <span aria-hidden="true" className="text-ink-faint transition-transform group-hover:translate-x-0.5">→</span>
                        </Link>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                  {inStage.length === 0 ? <EmptyState compact title="Nadie en esta etapa todavía" body="Cuando un proveedor llegue aquí lo verá en esta lista." /> : null}
                </ul>
              </section>
            </Reveal>
          </div>

          <Reveal>
            <ChartCard
              title="Merma recibida por mes"
              subtitle={`Promedio ponderado por volumen. La franja marca el ciclo ${band.label}. Meta ${WASTE_TARGET} %, línea base ${WASTE_BASELINE} %.`}
              table={lineTable([...MONTHS], [{ id: "m", label: "Merma recibida", color: "var(--chart-series)", values: waste }], " %")}
            >
              <LineChart
                labels={[...MONTHS]}
                series={[{ id: "m", label: "Merma recibida", color: "var(--chart-series)", values: waste }]}
                unit=" %"
                yMax={25}
                height={260}
                band={band}
                references={[
                  { value: WASTE_TARGET, label: `Meta ${WASTE_TARGET} %` },
                  { value: WASTE_BASELINE, label: `Base ${WASTE_BASELINE} %` },
                ]}
              />
            </ChartCard>
          </Reveal>
        </div>
      )}
    </>
  );
}
