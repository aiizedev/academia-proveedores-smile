"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { BarList, ChartCard, Legend, LineChart, ProgressRing, StatTile, lineTable, type Series } from "@/components/charts";
import { Icon } from "@/components/icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { T } from "@/design/motion-react";
import { cn } from "@/lib/cn";
import { MONTHS, SUPPLIERS, WASTE_BASELINE, WASTE_TARGET } from "@/mocks/smile";
import { cycleBand, fmtInt, fmtPct, kpiPanel, monthlyWaste, receptionsFor, wasteByCause, wasteByMunicipality } from "../_ui/data";
import { FilterBar, useFilters } from "../_ui/filters";
import { useArrival } from "../_ui/hooks";
import { DashboardSkeleton, EmptyState } from "../_ui/kit";

const farm = (id: string) => SUPPLIERS.find((s) => s.id === id)?.farm ?? id;

export function CalidadDashboard() {
  const { filters, reset } = useFilters();
  const arrived = useArrival();
  const k = useMemo(() => kpiPanel(filters), [filters]);
  const causes = useMemo(() => wasteByCause(filters), [filters]);
  const byMun = useMemo(() => wasteByMunicipality(filters), [filters]);
  const recs = useMemo(() => receptionsFor(filters), [filters]);
  const series: Series[] = useMemo(
    () =>
      filters.segment
        ? [{ id: "m", label: "Merma recibida", color: "var(--chart-series)", values: monthlyWaste(filters) }]
        : [
            { id: "est", label: "Estratégicos", color: "var(--chart-highlight)", values: monthlyWaste({ ...filters, segment: "ESTRATEGICO" }) },
            { id: "loc", label: "Locales", color: "var(--chart-local)", values: monthlyWaste({ ...filters, segment: "LOCAL" }) },
          ],
    [filters],
  );
  const band = cycleBand(filters);
  const totalRejected = causes.reduce((a, c) => a + c.kg, 0);
  const topCause = [...causes].sort((a, b) => b.kg - a.kg)[0];
  const onTime = recs.length ? Math.round((recs.filter((r) => r.onTime).length / recs.length) * 100) : 0;
  const d = (a: number, b?: number) => (b === undefined ? 0 : Math.round((a - b) * 10) / 10);
  const hasPrev = Boolean(k.prev && k.prev.active);

  if (!arrived) return (<><FilterBar /><DashboardSkeleton /></>);

  return (
    <>
      <FilterBar count={k.now.active} />
      {k.now.active === 0 ? (
        <EmptyState title="Aún no hay recepciones aquí" body="Con estos filtros no hay proveedores activos en el ciclo. Pruebe otro ciclo o limpie los filtros." action={<button type="button" onClick={reset} className="mt-2 rounded-[var(--radius-pill)] bg-olive-800 px-5 py-2.5 text-app-small font-bold text-cream">Limpiar filtros</button>} />
      ) : (
        <div className="grid gap-6">
          <Stagger className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StaggerItem className="[&>article]:h-full">
              <StatTile tone="strong" label="Merma recibida" value={k.now.waste} format={(n) => fmtPct(Math.round(n * 10) / 10)} goodWhen="down" delta={hasPrev ? { value: d(k.now.waste, k.prev?.waste), label: k.prevLabel, unit: " pp" } : undefined} trend={k.trend.map((t) => t.waste)} icon={<Icon name="residuos" size={18} />} />
            </StaggerItem>
            <StaggerItem className="[&>article]:h-full">
              <StatTile label="Kilos rechazados en el ciclo" value={totalRejected} format={(n) => `${fmtInt(n)} kg`} icon={<Icon name="alert" size={18} />} />
            </StaggerItem>
            <StaggerItem className="[&>article]:h-full">
              <StatTile label="Lotes con carencia verificada" value={k.now.carencia} format={(n) => fmtPct(Math.round(n * 10) / 10)} delta={hasPrev ? { value: d(k.now.carencia, k.prev?.carencia), label: k.prevLabel, unit: " pp" } : undefined} trend={k.trend.map((t) => t.carencia)} icon={<Icon name="bpa" size={18} />} />
            </StaggerItem>
            <StaggerItem className="[&>article]:h-full">
              <StatTile label="Recepciones a tiempo" value={onTime} format={(n) => `${Math.round(n)} %`} icon={<Icon name="check" size={18} />} />
            </StaggerItem>
          </Stagger>

          <Reveal>
            <ChartCard
              title="Tendencia de la merma recibida"
              subtitle={`Ponderada por volumen, enero a octubre de 2026. Franja: ciclo ${band.label}.`}
              legend={series.length > 1 ? <Legend items={series.map((s) => ({ label: s.label, color: s.color, shape: "line" as const }))} /> : undefined}
              table={lineTable([...MONTHS], series, " %")}
            >
              <LineChart
                labels={[...MONTHS]}
                series={series}
                unit=" %"
                yMax={25}
                height={280}
                band={band}
                references={[
                  { value: WASTE_TARGET, label: `Meta ${WASTE_TARGET} %` },
                  { value: WASTE_BASELINE, label: `Base ${WASTE_BASELINE} %` },
                ]}
              />
            </ChartCard>
          </Reveal>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="grid gap-6">
            <Reveal>
              <ChartCard
                title="Merma por causa"
                subtitle={topCause ? `La causa principal es ${topCause.label.toLowerCase()}.` : undefined}
                table={{ columns: [{ key: "c", label: "Causa" }, { key: "kg", label: "kg", numeric: true }, { key: "p", label: "%", numeric: true }], rows: causes.map((c) => ({ c: c.label, kg: fmtInt(c.kg), p: fmtPct(totalRejected ? Math.round((c.kg / totalRejected) * 1000) / 10 : 0) })) }}
              >
                <BarList
                  data={[...causes].sort((a, b) => b.kg - a.kg).map((c) => ({ id: c.id, label: c.label, value: c.kg, display: `${fmtInt(c.kg)} kg`, highlight: c.id === topCause?.id, hint: `${fmtPct(totalRejected ? Math.round((c.kg / totalRejected) * 1000) / 10 : 0)} de la merma` }))}
                />
                <p className="mt-4 text-app-caption text-ink-soft">Causas según C-06: plagas, daño mecánico postcosecha, descomposición natural y empaque.</p>
              </ChartCard>
            </Reveal>
              <Reveal delay={0.12}>
                <section className="flex items-center gap-6 rounded-[var(--radius-card)] border border-line bg-white p-6">
                  <ProgressRing value={Math.round(k.now.carencia)} size={150} stroke={13} sublabel="de los lotes" color="var(--chart-local)" />
                  <div>
                    <h3 className="font-display text-[1.25rem] leading-tight tracking-[-0.02em]">Carencia verificada</h3>
                    <p className="mt-1 text-app-small text-ink-soft">Lotes cuyo rótulo confirma que se respetó el período de carencia antes de la cosecha.</p>
                    <p className="mt-3 text-app-small text-ink-soft">
                      Meta DOC-FRUVER: <strong className="text-ink">100 %</strong>. Faltan {fmtPct(Math.max(0, Math.round((100 - k.now.carencia) * 10) / 10))}.
                    </p>
                  </div>
                </section>
              </Reveal>
            </div>
            <Reveal delay={0.06}>
              <ChartCard
                title="Merma por municipio"
                subtitle="Ponderada por volumen, en el ciclo."
                table={{ columns: [{ key: "m", label: "Municipio" }, { key: "d", label: "Departamento" }, { key: "v", label: "Merma", numeric: true }, { key: "n", label: "Proveedores", numeric: true }], rows: byMun.map((m) => ({ m: m.label, d: m.dept, v: fmtPct(m.value), n: m.n })) }}
              >
                <BarList max={25} data={byMun.map((m, i) => ({ id: m.id, label: m.label, value: m.value, display: fmtPct(m.value), highlight: i === 0, hint: `${m.dept} · ${m.n} proveedor${m.n === 1 ? "" : "es"}` }))} />
              </ChartCard>
            </Reveal>
          </div>

          <Reveal>
            <section className="rounded-[var(--radius-card)] border border-line bg-white p-6">
              <header className="mb-3 flex items-end justify-between">
                <div>
                  <h3 className="font-display text-[1.25rem] leading-tight tracking-[-0.02em]">Recepciones recientes</h3>
                  <p className="mt-1 text-app-small text-ink-soft">Rechazo por encima de la meta en rosa. {recs.length} recepciones en octubre.</p>
                </div>
              </header>
              <ul className="grid gap-x-6 xl:grid-cols-2 [&>*]:min-w-0">
                <AnimatePresence initial={false} mode="popLayout">
                  {recs.slice(0, 10).map((r, i) => {
                    const pct = r.kg ? Math.round((r.rejectedKg / r.kg) * 1000) / 10 : 0;
                    const over = pct > WASTE_TARGET;
                    return (
                      <motion.li
                        key={r.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, transition: { ...T.ui, delay: i * 0.03 } }}
                        exit={{ opacity: 0, transition: T.exit }}
                        className="flex items-center gap-3 border-b border-line py-3"
                      >
                        <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", r.labelOk ? "bg-olive-25 text-olive-700" : "bg-rose-100 text-rose-700")} title={r.labelOk ? "Rótulo válido" : "Sin rótulo"}>
                          <Icon name={r.labelOk ? "check" : "alert"} size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-app-small font-bold">{r.product} · {farm(r.supplierId)}</span>
                          <span className="block text-app-caption text-ink-soft">{r.id} · {r.date} · {r.kg} kg · {r.labelOk ? "carencia verificada" : "sin rótulo"}</span>
                        </span>
                        <span className={cn("rounded-[var(--radius-pill)] px-2.5 py-1 text-app-caption font-bold", over ? "bg-rose-100 text-rose-700" : "bg-olive-25 text-olive-700")} style={{ fontVariantNumeric: "tabular-nums" }}>
                          {fmtPct(pct)}
                        </span>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </section>
          </Reveal>
        </div>
      )}
    </>
  );
}
