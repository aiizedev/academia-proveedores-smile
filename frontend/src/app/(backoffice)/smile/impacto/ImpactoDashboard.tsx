"use client";

import { useMemo } from "react";
import { BarList, ChartCard, LineChart, lineTable } from "@/components/charts";
import { Icon, type IconName } from "@/components/icons";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { MONTHS } from "@/mocks/smile";
import { FOOTPRINT_BASE, FOOTPRINT_GOAL, cycleBand, fmtCopShort, fmtInt, impact, kpisAt, monthlyFootprint, odsProgress } from "../_ui/data";
import { FilterBar, useFilters } from "../_ui/filters";
import { useArrival } from "../_ui/hooks";
import { DashboardSkeleton, EmptyState } from "../_ui/kit";

export function ImpactoDashboard() {
  const { filters, reset } = useFilters();
  const arrived = useArrival();
  const im = useMemo(() => impact(filters), [filters]);
  const fp = useMemo(() => monthlyFootprint(filters), [filters]);
  const ods = useMemo(() => odsProgress(filters), [filters]);
  const now = useMemo(() => kpisAt(filters), [filters]);
  const band = cycleBand(filters);
  const change = FOOTPRINT_BASE ? Math.round(((now.footprint - FOOTPRINT_BASE) / FOOTPRINT_BASE) * 1000) / 10 : 0;

  if (!arrived) return (<><FilterBar /><DashboardSkeleton tiles={3} /></>);

  const social: Array<{ icon: IconName; value: number; unit: string; label: string }> = [
    { icon: "ddhh", value: im.formalJobs, unit: "", label: "empleos con seguridad social" },
    { icon: "infantil", value: im.schoolKids, unit: "", label: "menores con matrícula escolar verificada" },
    { icon: "residuos", value: im.containersKg, unit: " kg", label: "de envases devueltos a Campo Limpio" },
    { icon: "book", value: im.trainingHours, unit: " h", label: "de formación con SENA y aliados" },
  ];

  return (
    <>
      <FilterBar count={now.active} />
      {now.active === 0 ? (
        <EmptyState title="El impacto empieza con el primer proveedor" body="No hay proveedores activos con estos filtros. Limpie los filtros para ver el impacto de la red." action={<button type="button" onClick={reset} className="mt-2 rounded-[var(--radius-pill)] bg-olive-800 px-5 py-2.5 text-app-small font-bold text-cream">Limpiar filtros</button>} />
      ) : (
        <div className="grid gap-6">
          <Reveal>
            <section className="grain relative overflow-hidden rounded-[var(--radius-sheet)] bg-olive-800 px-8 py-8 text-cream">
              <div className="relative z-[var(--z-content)] grid gap-8 xl:grid-cols-3 [&>*]:min-w-0">
                {[
                  { k: "Ahorro generado a la red", v: <CountUp value={im.totalSavings} format={(n) => fmtCopShort(n)} />, note: "merma evitada, insumos y fletes, en el ciclo" },
                  { k: "Emisiones evitadas", v: <CountUp value={im.avoidedCo2} decimals={1} suffix=" t CO₂e" />, note: `huella ${change <= 0 ? "" : "+"}${change.toLocaleString("es-CO")} % frente a la línea base` },
                  { k: "Merma evitada", v: <CountUp value={im.avoidedWasteKg} format={(n) => `${fmtInt(n)} kg`} />, note: "frente a la línea base del 22 %" },
                ].map((s, i) => (
                  <div key={s.k} className={i ? "xl:border-l xl:border-[var(--on-strong-tint-line)] xl:pl-8" : ""}>
                    <p className="text-[0.66rem] font-extrabold uppercase tracking-[var(--tracking-caps)] text-rose-300">{s.k}</p>
                    <p className="mt-3 font-body text-[2.6rem] font-semibold leading-none tracking-[-0.03em]">{s.v}</p>
                    <p className="mt-2 text-app-small text-olive-300">{s.note}</p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <Reveal>
              <ChartCard
                title="Huella de carbono de la cadena"
                subtitle={`kg CO₂e por tonelada, ponderada por volumen (factores DOC-FRUVER, C-12). Franja: ciclo ${band.label}.`}
                table={lineTable([...MONTHS], [{ id: "fp", label: "kg CO₂e/t", color: "var(--chart-series)", values: fp }])}
              >
                <LineChart
                  labels={[...MONTHS]}
                  series={[{ id: "fp", label: "kg CO₂e/t", color: "var(--chart-series)", values: fp }]}
                  height={280}
                  yMin={100}
                  refLabelAt="start"
                  yMax={200}
                  band={band}
                  references={[
                    { value: FOOTPRINT_BASE, label: `Base ${FOOTPRINT_BASE}` },
                    { value: FOOTPRINT_GOAL, label: `Meta −15 % · ${FOOTPRINT_GOAL}` },
                  ]}
                />
              </ChartCard>
            </Reveal>
            <Reveal delay={0.08}>
              <ChartCard
                title="Ahorro generado a la red"
                subtitle="Por fuente, en el ciclo (COP)."
                table={{ columns: [{ key: "f", label: "Fuente" }, { key: "v", label: "COP", numeric: true }], rows: im.savings.map((s) => ({ f: s.label, v: fmtCopShort(s.value) })) }}
              >
                <BarList data={im.savings.map((s, i) => ({ id: s.id, label: s.label, value: s.value, display: fmtCopShort(s.value), highlight: i === 0, hint: "ahorro del ciclo" }))} />
                <p className="mt-5 text-app-caption text-ink-soft">La merma evitada se valora al precio medio pagado por Smile. El resto se estima con los factores del modelo de valor compartido.</p>
              </ChartCard>
            </Reveal>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <Reveal>
              <section className="h-full rounded-[var(--radius-card)] border border-line bg-white p-6">
                <h3 className="font-display text-[1.25rem] leading-tight tracking-[-0.02em]">Retorno social</h3>
                <p className="mt-1 text-app-small text-ink-soft">Lo que cambia en las fincas de la red este ciclo (simulado).</p>
                <Stagger inView className="mt-5 grid grid-cols-2 gap-3 [&>*]:h-full">
                  {social.map((s) => (
                    <StaggerItem key={s.label} className="lift rounded-[var(--radius-control)] bg-cream p-4">
                      <span className="grid size-9 place-items-center rounded-full bg-rose-100 text-olive-800">
                        <Icon name={s.icon} size={18} />
                      </span>
                      <p className="mt-3 font-body text-[1.8rem] font-semibold leading-none tracking-[-0.02em]">
                        <CountUp value={s.value} suffix={s.unit} />
                      </p>
                      <p className="mt-1.5 text-app-caption text-ink-soft">{s.label}</p>
                    </StaggerItem>
                  ))}
                </Stagger>
              </section>
            </Reveal>
            <Reveal delay={0.08}>
              <ChartCard
                title="Avance hacia los ODS"
                subtitle="Promedio de los ejes mapeados a cada objetivo en el banco v4."
                table={{ columns: [{ key: "o", label: "Objetivo" }, { key: "v", label: "Avance", numeric: true }, { key: "q", label: "Preguntas", numeric: true }], rows: ods.map((o) => ({ o: o.label, v: `${o.value} %`, q: o.questions })) }}
              >
                <BarList max={100} data={ods.map((o) => ({ id: o.id, label: o.label, value: o.value, display: `${o.value} %`, hint: `${o.questions} preguntas mapeadas` }))} />
              </ChartCard>
            </Reveal>
          </div>
        </div>
      )}
    </>
  );
}
