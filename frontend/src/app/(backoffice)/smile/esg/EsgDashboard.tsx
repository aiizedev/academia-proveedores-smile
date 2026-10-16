"use client";

import { useMemo, useState } from "react";
import { BarList, ChartCard, Heatmap, ProgressRing, StatTile } from "@/components/charts";
import { Icon } from "@/components/icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { AXES } from "@/mocks/smile";
import { axisHeat, fmtPct, frameworkCompliance, kpiPanel, rowsAt } from "../_ui/data";
import { FilterBar, useFilters } from "../_ui/filters";
import { useArrival } from "../_ui/hooks";
import { DashboardSkeleton, EmptyState } from "../_ui/kit";

const SHORT_AXIS: Record<string, string> = { bpa: "BPA", residuos: "Residuos", carbono: "Carbono", infantil: "Infantil", ddhh: "DDHH y SST" };

export function EsgDashboard() {
  const { filters, reset } = useFilters();
  const arrived = useArrival();
  const [fw, setFw] = useState<string | null>(null);
  const [mun, setMun] = useState<string | null>(null);
  const rows = useMemo(() => rowsAt(filters), [filters]);
  const k = useMemo(() => kpiPanel(filters), [filters]);
  const frameworks = useMemo(() => frameworkCompliance(filters), [filters]);
  const heat = useMemo(() => axisHeat(filters), [filters]);
  const n = rows.length;
  const childFree = rows.filter((r) => r.c.childLaborFree).length;
  const bpa = rows.filter((r) => r.s.bpaIca).length;
  const hasPrev = Boolean(k.prev && k.prev.active);
  const sel = frameworks.find((f) => f.id === fw);

  if (!arrived) return (<><FilterBar /><DashboardSkeleton /></>);

  return (
    <>
      <FilterBar count={n} />
      {n === 0 ? (
        <EmptyState title="Nada que reportar todavía" body="No hay proveedores evaluados con estos filtros. Limpie los filtros para ver la consola completa." action={<button type="button" onClick={reset} className="mt-2 rounded-[var(--radius-pill)] bg-olive-800 px-5 py-2.5 text-app-small font-bold text-cream">Limpiar filtros</button>} />
      ) : (
        <div className="grid gap-6">
          <Stagger className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StaggerItem className="[&>article]:h-full">
              <StatTile tone="strong" label="Cadena libre de trabajo infantil" value={k.now.childFree} format={(v) => fmtPct(Math.round(v * 10) / 10)} delta={hasPrev ? { value: Math.round((k.now.childFree - (k.prev?.childFree ?? 0)) * 10) / 10, label: k.prevLabel, unit: " pp" } : undefined} trend={k.trend.map((t) => t.childFree)} icon={<Icon name="infantil" size={18} />} />
            </StaggerItem>
            <StaggerItem className="[&>article]:h-full"><StatTile label="Con BPA ICA (Res. 30021)" value={Math.round((bpa / n) * 100)} format={(v) => `${Math.round(v)} %`} icon={<Icon name="bpa" size={18} />} /></StaggerItem>
            <StaggerItem className="[&>article]:h-full"><StatTile label="Trazabilidad de lotes" value={k.now.carencia} format={(v) => fmtPct(Math.round(v * 10) / 10)} trend={k.trend.map((t) => t.carencia)} icon={<Icon name="route" size={18} />} /></StaggerItem>
            <StaggerItem className="[&>article]:h-full"><StatTile label="Score medio de sostenibilidad" value={k.now.score} format={(v) => v.toLocaleString("es-CO", { maximumFractionDigits: 1 })} trend={k.trend.map((t) => t.score)} icon={<Icon name="chart" size={18} />} /></StaggerItem>
          </Stagger>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <Reveal>
              <ChartCard
                title="Cumplimiento por marco"
                subtitle="Promedio ponderado de los ejes de las preguntas mapeadas a cada marco. Clic para ver el detalle."
                table={{ columns: [{ key: "f", label: "Marco" }, { key: "v", label: "Cumplimiento", numeric: true }, { key: "q", label: "Preguntas", numeric: true }], rows: frameworks.map((f) => ({ f: f.label, v: fmtPct(f.value), q: f.questions })) }}
              >
                <BarList max={100} selected={fw} onSelect={(id) => setFw((x) => (x === id ? null : id))} data={frameworks.map((f) => ({ id: f.id, label: f.label, value: f.value, display: fmtPct(f.value), hint: `${f.questions} preguntas del banco` }))} />
                <p className="mt-4 min-h-10 text-app-small text-ink-soft" aria-live="polite">
                  {sel ? (
                    <>
                      <strong className="text-ink">{sel.label}</strong>: {sel.questions} preguntas del banco v4 alimentan este indicador; {fmtPct(sel.value)} de cumplimiento medio en {n} proveedores.
                    </>
                  ) : (
                    "Cada pregunta del banco mapea a B Corp, ISO 14001, GRI, ODS, TCFD/SASB y normativa colombiana."
                  )}
                </p>
              </ChartCard>
            </Reveal>
            <Reveal delay={0.08}>
              <section className="flex h-full flex-col items-center rounded-[var(--radius-card)] border border-line bg-white p-6 text-center">
                <h3 className="self-start font-display text-[1.25rem] leading-tight tracking-[-0.02em]">Cadena libre de trabajo infantil</h3>
                <p className="mt-1 self-start text-left text-app-small text-ink-soft">Autodeclaración verificada y eje de trabajo infantil sin alertas.</p>
                <div className="my-6">
                  <ProgressRing value={Math.round(k.now.childFree)} size={176} stroke={14} sublabel={`${childFree} de ${n}`} color="var(--chart-local)" />
                </div>
                <p className="text-app-small text-ink-soft">
                  {n - childFree === 0 ? "Ningún proveedor con alerta. ¡Así se cuida la cadena!" : `${n - childFree} proveedor${n - childFree === 1 ? "" : "es"} con alerta: ruta ICBF línea 141 y acompañamiento del eje 4.`}
                </p>
              </section>
            </Reveal>
          </div>

          <Reveal>
            <ChartCard
              title="Municipio × eje"
              subtitle="Promedio del eje en cada municipio. Clic en un municipio para resaltarlo."
              table={{ columns: [{ key: "m", label: "Municipio" }, ...AXES.map((a) => ({ key: a.code, label: SHORT_AXIS[a.code] ?? a.name, numeric: true }))], rows: heat.rows.map((m) => ({ m, ...Object.fromEntries(AXES.map((a) => [a.code, Math.round(heat.cells.find((c) => c.row === m && c.col === a.code)?.value ?? 0)])) })) }}
            >
              <Heatmap rows={heat.rows} cols={AXES.map((a) => ({ id: a.code, label: SHORT_AXIS[a.code] ?? a.name }))} cells={heat.cells} selectedRow={mun} onSelectRow={(m) => setMun((x) => (x === m ? null : m))} />
            </ChartCard>
          </Reveal>
        </div>
      )}
    </>
  );
}
