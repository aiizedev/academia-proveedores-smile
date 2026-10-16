"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChartCard, Legend, LineChart, ProgressRing, RiskMatrix, type Point } from "@/components/charts";
import { CountUp } from "@/components/motion";
import { GLIDE, T } from "@/design/motion-react";
import { cn } from "@/lib/cn";
import { AXES } from "@/mocks/smile";
import { QUADRANTS, RISK_THRESHOLD, VOLUME_MAX, fmtPct, pareto, quadrantOf, rowsAt, type QuadrantId, type Row } from "../_ui/data";
import { FilterBar, useFilters } from "../_ui/filters";
import { useArrival } from "../_ui/hooks";
import { DashboardSkeleton, EmptyState, SegmentBadge, StageBadge } from "../_ui/kit";

type SortKey = "farm" | "municipality" | "stage" | "score" | "waste" | "volume" | "quadrant";
const QUAD_ORDER: Record<QuadrantId, number> = { atender: 0, acompanar: 1, aliados: 2, mantener: 3 };

export function RiesgoDashboard() {
  const { filters, reset } = useFilters();
  const arrived = useArrival();
  const [selected, setSelected] = useState<string | null>(null);
  const [quad, setQuad] = useState<QuadrantId | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "quadrant", dir: 1 });

  const rows = useMemo(() => rowsAt(filters), [filters]);
  const par = useMemo(() => pareto(filters), [filters]);
  const quadOf = (r: Row) => quadrantOf(r.c.score, r.x.volumeKg);
  const counts = QUADRANTS.map((q) => ({ ...q, n: rows.filter((r) => quadOf(r) === q.id).length }));
  const visible = rows.filter((r) => !quad || quadOf(r) === quad);
  const sel = rows.find((r) => r.s.id === selected) ?? null;

  const points: Point[] = visible.map((r) => ({
    id: r.s.id,
    label: r.s.farm,
    x: r.c.score,
    y: r.x.volumeKg,
    segment: r.s.segment,
    meta: `${r.s.municipality} · ${r.c.stage}`,
  }));

  const sorted = [...visible].sort((a, b) => {
    const v = (r: Row): string | number =>
      ({ farm: r.s.farm, municipality: r.s.municipality, stage: r.c.stage, score: r.c.score, waste: r.c.wastePct, volume: r.x.volumeKg, quadrant: QUAD_ORDER[quadOf(r)] * 1000 + r.c.score })[sort.key];
    const x = v(a);
    const y = v(b);
    return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "es")) * sort.dir;
  });
  const header = (key: SortKey, label: string, numeric = false) => (
    <th scope="col" className={cn("py-3 font-semibold", numeric && "text-right")} aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }))}
        className={cn("inline-flex items-center gap-1 rounded-[var(--radius-check)] px-1 hover:text-ink", sort.key === key ? "text-ink" : "text-ink-soft")}
      >
        {label}
        <span aria-hidden="true" className={cn("text-[0.7rem] transition-transform", sort.key === key ? "opacity-100" : "opacity-30", sort.key === key && sort.dir === -1 && "rotate-180")}>
          ▲
        </span>
      </button>
    </th>
  );

  if (!arrived) return (<><FilterBar /><DashboardSkeleton tiles={4} /></>);

  return (
    <>
      <FilterBar count={rows.length} />
      {rows.length === 0 ? (
        <EmptyState title="Sin puntos que mostrar" body="Ningún proveedor coincide con los filtros. Limpie los filtros para volver a ver la red completa." action={<button type="button" onClick={reset} className="mt-2 rounded-[var(--radius-pill)] bg-olive-800 px-5 py-2.5 text-app-small font-bold text-cream">Limpiar filtros</button>} />
      ) : (
        <div className="grid gap-6">
          <LayoutGroup id="quads">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4" role="group" aria-label="Cuadrantes de riesgo">
              {counts.map((q) => {
                const on = quad === q.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setQuad(on ? null : q.id)}
                    className={cn("relative overflow-hidden rounded-[var(--radius-card)] border p-4 text-left transition-colors", on ? "border-transparent text-cream" : "border-line bg-white hover:bg-cream")}
                  >
                    {on ? <motion.span layoutId="quad-on" transition={GLIDE} className="absolute inset-0 bg-olive-800" aria-hidden="true" /> : null}
                    <span className="relative flex items-baseline justify-between gap-2">
                      <span className="text-app-small font-bold">{q.label}</span>
                      <span className="font-body text-[1.6rem] font-semibold leading-none tracking-[-0.02em]">
                        <CountUp value={q.n} />
                      </span>
                    </span>
                    <span className={cn("relative mt-1 block text-app-caption", on ? "text-olive-300" : "text-ink-soft")}>{q.hint}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
            <ChartCard
              title="Matriz de 31 proveedores"
              subtitle={`Umbral de score ${RISK_THRESHOLD}. Eje vertical en raíz cuadrada para separar los volúmenes pequeños. En producción: 450 proveedores.`}
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
                  { key: "x", label: "Score", numeric: true },
                  { key: "y", label: "kg/mes", numeric: true },
                ],
                rows: points.map((p) => ({ p: p.label, x: p.x, y: p.y.toLocaleString("es-CO") })),
              }}
            >
              <RiskMatrix points={points} height={500} yMax={VOLUME_MAX} yScale="sqrt" selected={selected} onSelect={(id) => setSelected((s) => (s === id ? null : id))} />
            </ChartCard>

            <aside className="relative min-h-[28rem]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {sel ? (
                  <motion.div
                    key={sel.s.id}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12, transition: T.exit }}
                    transition={T.enter}
                    className="grain sticky top-24 overflow-hidden rounded-[var(--radius-card)] bg-olive-800 p-6 text-cream"
                  >
                    <div className="relative z-[var(--z-content)]">
                      <div className="flex items-start justify-between gap-3">
                        <SegmentBadge segment={sel.s.segment} />
                        <button type="button" onClick={() => setSelected(null)} aria-label="Cerrar ficha" className="grid size-8 place-items-center rounded-full text-olive-300 hover:bg-[var(--on-strong-tint-bg)] hover:text-cream">
                          ✕
                        </button>
                      </div>
                      <h3 className="mt-3 font-display text-[1.6rem] leading-[1.05] tracking-[-0.02em]">{sel.s.farm}</h3>
                      <p className="mt-1 text-app-small text-olive-300">
                        {sel.s.rep} · {sel.s.municipality}, {sel.s.department}
                      </p>
                      <div className="mt-5 flex items-center gap-5">
                        <div className="rounded-full bg-cream p-1.5 text-ink">
                          <ProgressRing value={sel.c.score} size={104} stroke={10} sublabel="score" />
                        </div>
                        <dl className="grid gap-2 text-app-small">
                          <div><dt className="text-olive-300">Etapa</dt><dd className="font-bold text-cream">{sel.c.stage}</dd></div>
                          <div><dt className="text-olive-300">Merma</dt><dd className="font-bold">{fmtPct(sel.c.wastePct)}</dd></div>
                          <div><dt className="text-olive-300">Volumen</dt><dd className="font-bold">{sel.x.volumeKg.toLocaleString("es-CO")} kg/mes</dd></div>
                        </dl>
                      </div>
                      <p className="mt-5 text-[0.66rem] font-extrabold uppercase tracking-[var(--tracking-caps)] text-rose-300">Ejes más débiles</p>
                      <ul className="mt-2 grid gap-2">
                        {[...AXES].sort((a, b) => sel.s.axes[a.code] - sel.s.axes[b.code]).slice(0, 3).map((a, i) => (
                          <li key={a.code}>
                            <div className="flex justify-between text-app-caption"><span>{a.name}</span><strong>{sel.s.axes[a.code]}</strong></div>
                            <div className="mt-1 h-1.5 rounded-[var(--radius-pill)] bg-[var(--on-strong-tint-bg)]">
                              <motion.div className="h-full rounded-[var(--radius-pill)] bg-rose-500" initial={{ width: 0 }} animate={{ width: `${sel.s.axes[a.code]}%` }} transition={{ ...T.reveal, delay: 0.1 + i * 0.08 }} />
                            </div>
                          </li>
                        ))}
                      </ul>
                      <Link href={`/smile/proveedores/${sel.s.id}`} className="mt-6 flex h-11 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-rose-500 text-app-small font-extrabold text-olive-900 transition-[scale] active:scale-[var(--press-scale)]">
                        Abrir expediente →
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: T.exit }} transition={T.ui} className="grid h-full place-items-center rounded-[var(--radius-card)] border border-dashed border-line-olive p-6">
                    <EmptyState compact title="Elija un proveedor" body="Haga clic en un punto de la matriz o en una fila de la tabla y su ficha aparece aquí." />
                  </motion.div>
                )}
              </AnimatePresence>
            </aside>
          </div>

          <div className="grid gap-6 min-[1400px]:grid-cols-[minmax(0,1fr)_minmax(0,1.85fr)]">
            <ChartCard
              title="Curva de Pareto"
              subtitle={`% acumulado del gasto por proveedor, de mayor a menor. ${par.to80} proveedores explican el 80 %.`}
              table={{ columns: [{ key: "r", label: "#" }, { key: "p", label: "Proveedor" }, { key: "c", label: "% acumulado", numeric: true }], rows: par.items.map((i, k) => ({ r: k + 1, p: i.label, c: fmtPct(i.cum) })) }}
            >
              <LineChart
                labels={par.items.map((_, k) => String(k + 1))}
                series={[{ id: "cum", label: "% acumulado del gasto", color: "var(--chart-highlight)", values: par.items.map((i) => i.cum) }]}
                unit=" %"
                yMax={100}
                height={250}
                references={[{ value: 80, label: "80 %" }]}
              />
            </ChartCard>

            <section className="rounded-[var(--radius-card)] border border-line bg-white p-6">
              <header className="mb-2 flex items-end justify-between">
                <div>
                  <h3 className="font-display text-[1.25rem] leading-tight tracking-[-0.02em]">Tabla de riesgo</h3>
                  <p className="mt-1 text-app-small text-ink-soft">Ordene por cualquier columna. Clic en una fila para verla en la matriz.</p>
                </div>
                {quad ? <button type="button" onClick={() => setQuad(null)} className="text-app-caption font-bold text-rose-700 hover:underline">Quitar cuadrante</button> : null}
              </header>
              <div className="relative max-h-[24rem] overflow-y-auto">
                <table className="w-full border-collapse text-left text-app-small">
                  <thead className="sticky top-0 z-[var(--z-content)] bg-white">
                    <tr className="border-b border-line">
                      {header("farm", "Proveedor")}
                      {header("stage", "Etapa")}
                      {header("score", "Score", true)}
                      {header("waste", "Merma", true)}
                      {header("volume", "kg/mes", true)}
                      {header("quadrant", "Cuadrante")}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((r) => {
                      const on = selected === r.s.id;
                      return (
                        <motion.tr
                          key={r.s.id}
                          layout="position"
                          transition={T.ui}
                          onClick={() => setSelected(on ? null : r.s.id)}
                          className={cn("cursor-pointer border-b border-line transition-colors", on ? "bg-rose-100" : "hover:bg-cream")}
                        >
                          <td className="py-2.5 pr-2">
                            <span className="flex items-center gap-2">
                              <span className="font-bold whitespace-nowrap">{r.s.farm}</span>
                            </span>
                            <span className="block text-app-caption text-ink-soft">{r.s.municipality}</span>
                          </td>
                          <td><StageBadge stage={r.c.stage} /></td>
                          <td className="text-right font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>{r.c.score}</td>
                          <td className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{fmtPct(r.c.wastePct)}</td>
                          <td className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{r.x.volumeKg.toLocaleString("es-CO")}</td>
                          <td className="pl-3"><QuadChip id={quadOf(r)} /></td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}

function QuadChip({ id }: { id: QuadrantId }) {
  const label = QUADRANTS.find((q) => q.id === id)?.label ?? id;
  const tone = { atender: "bg-rose-700 text-white", acompanar: "bg-rose-100 text-rose-700", aliados: "bg-olive-800 text-cream", mantener: "bg-olive-50 text-olive-700" }[id];
  return <span className={cn("inline-flex whitespace-nowrap rounded-[var(--radius-pill)] px-2.5 py-1 text-app-caption font-bold", tone)}>{label}</span>;
}
