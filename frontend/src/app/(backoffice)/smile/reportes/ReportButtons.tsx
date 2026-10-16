"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { Stagger, StaggerItem } from "@/components/motion";
import { DUR, PRESS, T } from "@/design/motion-react";
import { cn } from "@/lib/cn";
import { AXES, STAGE_LABEL } from "@/mocks/smile";
import { downloadCsv, toCsv } from "../_ui/csv";
import { cycleMeta, rowsAt, type Filters, type Row } from "../_ui/data";
import { FilterBar, useFilters } from "../_ui/filters";

/* Reportes 1 clic (RF-RPT-005). Respetan los filtros globales y RF-PRV-007 (solo agregados). */
type Report = { id: string; icon: IconName; title: string; desc: string; cols: string[]; file: string; steps: string[]; build: (rows: Row[], f: Filters) => string };

const REPORTS: Report[] = [
  {
    id: "huella",
    icon: "carbono",
    title: "Huella de carbono de la cadena",
    desc: "kg CO₂e por tonelada producida, por proveedor (Alcance 3 de Smile, factores DOC-FRUVER).",
    cols: ["NIT", "Proveedor", "Toneladas del ciclo", "kg CO₂e/t"],
    file: "huella-carbono",
    steps: ["Reuniendo volúmenes del ciclo", "Aplicando factores C-12", "Generando el archivo"],
    build: (rows, f) =>
      toCsv(
        ["Ciclo", "NIT", "Proveedor", "Municipio", "Toneladas del ciclo", "kg CO2e por t", "t CO2e"],
        rows.map((r) => {
          const t = Math.round((r.x.volumeKg * cycleMeta(f.cycle).months.length) / 100) / 10;
          return [f.cycle, r.s.nit, r.s.farm, r.s.municipality, t, r.c.footprint, Math.round(t * r.c.footprint) / 1000];
        }),
      ),
  },
  {
    id: "ddhh",
    icon: "infantil",
    title: "Matriz de derechos humanos y trabajo infantil",
    desc: "Autodeclaración, eje de trabajo infantil y de derechos humanos y SST por proveedor.",
    cols: ["NIT", "Libre de trabajo infantil", "Eje infantil", "Eje DDHH y SST"],
    file: "matriz-ddhh",
    steps: ["Leyendo autodeclaraciones", "Cruzando con el eje 4 y 5", "Generando el archivo"],
    build: (rows, f) => toCsv(["Ciclo", "NIT", "Proveedor", "Libre de trabajo infantil", "Eje trabajo infantil", "Eje DDHH y SST"], rows.map((r) => [f.cycle, r.s.nit, r.s.farm, r.c.childLaborFree ? "Sí" : "No", r.s.axes.infantil, r.s.axes.ddhh])),
  },
  {
    id: "retorno",
    icon: "ddhh",
    title: "Retorno social y ambiental",
    desc: "Score, etapa, merma y margen agregado por proveedor (marco Porter & Kramer).",
    cols: ["Score y etapa", "Merma %", "Margen % agregado", "5 ejes"],
    file: "retorno-social-ambiental",
    steps: ["Calculando pilares 50/30/20", "Agregando márgenes (sin transacciones)", "Generando el archivo"],
    build: (rows, f) =>
      toCsv(
        ["Ciclo", "NIT", "Proveedor", "Segmento", "Etapa", "Score", "Merma %", "Margen %", ...AXES.map((a) => a.name)],
        rows.map((r) => [f.cycle, r.s.nit, r.s.farm, r.s.segment, STAGE_LABEL[r.c.stage], r.c.score, r.c.wastePct, r.s.finance.marginPct, ...AXES.map((a) => r.s.axes[a.code])]),
      ),
  },
  {
    id: "calidad",
    icon: "bpa",
    title: "Calidad: merma y carencia",
    desc: "Merma recibida y % de lotes con carencia verificada por proveedor, frente a la meta del 8 %.",
    cols: ["Merma %", "Carencia verificada %", "Meta 8 %", "Estado"],
    file: "calidad-merma-carencia",
    steps: ["Reuniendo recepciones", "Calculando merma ponderada", "Generando el archivo"],
    build: (rows, f) => toCsv(["Ciclo", "NIT", "Proveedor", "Merma %", "Carencia verificada %", "Cumple meta 8 %"], rows.map((r) => [f.cycle, r.s.nit, r.s.farm, r.c.wastePct, r.c.carenciaPct, r.c.wastePct <= 8 ? "Sí" : "No"])),
  },
];

type State = { phase: "idle" | "running" | "done"; step: number };

function ReportCard({ report, index }: { report: Report; index: number }) {
  const { filters } = useFilters();
  const [st, setSt] = useState<State>({ phase: "idle", step: 0 });
  const timers = useRef<number[]>([]);
  const rows = rowsAt(filters);

  function run() {
    timers.current.forEach(clearTimeout);
    setSt({ phase: "running", step: 0 });
    const stepMs = DUR.l * 1000;
    report.steps.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setSt({ phase: "running", step: i + 1 }), stepMs * (i + 1)));
    });
    timers.current.push(
      window.setTimeout(() => {
        downloadCsv(`${report.file}-${filters.cycle}.csv`, report.build(rows, filters));
        setSt({ phase: "done", step: report.steps.length });
      }, stepMs * (report.steps.length + 0.4)),
    );
  }
  const pct = st.phase === "idle" ? 0 : st.phase === "done" ? 100 : Math.round((st.step / report.steps.length) * 92) + 6;

  return (
    <article className="group relative isolate flex h-full min-h-[23rem] flex-col overflow-hidden rounded-[var(--radius-l)] border border-line bg-white p-7 transition-colors duration-[var(--dur-m)] hover:border-transparent hover:text-cream">
      {/* Capa que sube al pasar el puntero (tarjeta de eje, GUIA_VISUAL §8.12) */}
      <span aria-hidden="true" className="absolute -inset-[2px] -z-10 translate-y-[101%] rounded-[var(--radius-rise)] bg-olive-800 transition-[translate,border-radius] duration-[var(--dur-l)] ease-[var(--ease-out)] group-hover:translate-y-0 group-hover:rounded-none" />
      <div className="flex items-start justify-between">
        <span className="rounded-[var(--radius-pill)] border border-current px-3 py-0.5 font-display text-[0.95rem] opacity-80" style={{ fontVariantNumeric: "tabular-nums" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="grid size-14 place-items-center rounded-full bg-rose-100 text-olive-800 transition-[rotate,scale,background-color] duration-[var(--dur-l)] ease-[var(--ease-out)] group-hover:scale-105 group-hover:-rotate-12 group-hover:bg-rose-500">
          <Icon name={report.icon} size={26} />
        </span>
      </div>
      <h2 className="mt-auto max-w-[16ch] pt-8 font-display text-[1.7rem] leading-[1.04] tracking-[-0.03em]">{report.title}</h2>
      <p className="mt-2 text-app-small opacity-75">{report.desc}</p>
      <ul className="mt-4 grid text-app-caption">
        {report.cols.map((c) => (
          <li key={c} className="flex items-center gap-2 border-t border-line py-1.5 transition-colors duration-[var(--dur-m)] group-hover:border-line-light">
            <span className="size-1.5 rounded-full bg-rose-500" aria-hidden="true" />
            {c}
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <AnimatePresence mode="wait" initial={false}>
          {st.phase === "running" ? (
            <motion.div key="run" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={T.ui} aria-live="polite">
              <div className="flex justify-between text-app-caption font-bold">
                <span>{report.steps[Math.min(st.step, report.steps.length - 1)]}…</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{pct} %</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--chart-track)]">
                <motion.div className="h-full rounded-[var(--radius-pill)] bg-rose-500" initial={{ width: "0%" }} animate={{ width: `${pct}%` }} transition={T.reveal} />
              </div>
            </motion.div>
          ) : (
            <motion.button
              key={st.phase}
              type="button"
              onClick={run}
              disabled={rows.length === 0}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={T.ui}
              whileTap={{ scale: PRESS.button }}
              className={cn("flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] text-app-small font-extrabold disabled:opacity-45", st.phase === "done" ? "bg-rose-500 text-olive-900" : "bg-olive-800 text-cream group-hover:bg-rose-500 group-hover:text-olive-900")}
            >
              {st.phase === "done" ? (
                <>
                  <Icon name="check" size={18} /> Descargado · otra vez
                </>
              ) : (
                <>
                  Generar CSV · {rows.length} proveedores <Icon name="arrow" size={18} />
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}

export function ReportButtons() {
  return (
    <>
      <FilterBar count={rowsAt(useFilters().filters).length} />
      <Stagger className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-4">
        {REPORTS.map((r, i) => (
          <StaggerItem key={r.id}>
            <ReportCard report={r} index={i} />
          </StaggerItem>
        ))}
      </Stagger>
    </>
  );
}
