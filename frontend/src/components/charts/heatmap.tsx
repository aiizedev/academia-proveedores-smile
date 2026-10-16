"use client";
/* Mapa de calor (filas × columnas) para magnitudes 0–100.
   Secuencial de un solo tono: reutiliza la rampa validada --chart-ord-1…6 (claro → oscuro).
   El valor va escrito en la celda con tinta (oscura en pasos claros, crema en oscuros):
   la lectura nunca depende solo del color. Celdas separadas por 2 px de superficie. */
import { motion } from "framer-motion";
import { STAGGER, T } from "@/design/motion-react";
import { ORDINAL, tipAt, useTooltip } from "./core";

export type HeatCell = { row: string; col: string; value: number | null; hint?: string };

const STEPS = [0, 40, 50, 60, 70, 80] as const;
const stepOf = (v: number) => {
  let k = 0;
  STEPS.forEach((t, i) => {
    if (v >= t) k = i;
  });
  return k;
};

export function Heatmap({
  rows,
  cols,
  cells,
  unit = "",
  onSelectRow,
  selectedRow,
}: {
  rows: string[];
  cols: { id: string; label: string }[];
  cells: HeatCell[];
  unit?: string;
  onSelectRow?: (row: string) => void;
  selectedRow?: string | null;
}) {
  const tip = useTooltip();
  const at = (r: string, c: string) => cells.find((x) => x.row === r && x.col === c);
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full table-fixed border-separate border-spacing-[2px] text-app-caption" aria-label="Mapa de calor">
        <thead>
          <tr>
            <th scope="col" className="w-36">
              <span className="sr-only">Fila</span>
            </th>
            {cols.map((c) => (
              <th key={c.id} scope="col" className="px-1 pb-2 text-center align-bottom font-semibold text-ink-soft">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => {
            const dim = selectedRow && selectedRow !== r;
            return (
              <tr key={r} style={{ opacity: dim ? 0.45 : 1 }} className="transition-opacity">
                <th scope="row" className="pr-3 text-left font-semibold whitespace-nowrap text-ink">
                  {onSelectRow ? (
                    <button type="button" className="rounded-[var(--radius-check)] px-1 hover:bg-cream-200" onClick={() => onSelectRow(r)} aria-pressed={selectedRow === r}>
                      {r}
                    </button>
                  ) : (
                    r
                  )}
                </th>
                {cols.map((c, ci) => {
                  const cell = at(r, c.id);
                  const v = cell?.value ?? null;
                  const k = v === null ? -1 : stepOf(v);
                  const label = v === null ? "—" : `${Math.round(v)}${unit}`;
                  return (
                    <td key={c.id} className="p-0">
                      <motion.div
                        tabIndex={0}
                        aria-label={`${r} · ${c.label}: ${label}`}
                        className="grid h-10 min-w-12 place-items-center rounded-[var(--radius-mark)] font-bold outline-none"
                        initial={{ opacity: 0, scale: 0.85 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        animate={{ backgroundColor: k < 0 ? "var(--cream-200)" : ORDINAL[k] }}
                        viewport={{ once: true }}
                        transition={{ opacity: { ...T.ui, delay: (ri + ci) * STAGGER.tight * 0.5 }, scale: { ...T.ui, delay: (ri + ci) * STAGGER.tight * 0.5 }, backgroundColor: T.reveal }}
                        style={{ color: k >= 3 ? "var(--cream)" : k < 0 ? "var(--ink-soft)" : "var(--olive-900)", fontVariantNumeric: "tabular-nums" }}
                        onPointerMove={(e) => tip.show({ ...tipAt(e), title: `${r} · ${c.label}`, rows: [{ label: cell?.hint ?? "promedio", value: label }] })}
                        onFocus={(e) => tip.show({ ...tipAt(e), title: `${r} · ${c.label}`, rows: [{ label: cell?.hint ?? "promedio", value: label }] })}
                        onBlur={tip.hide}
                      >
                        {label}
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-3 flex items-center gap-2 text-app-caption text-ink-soft" aria-hidden="true">
        <span>Menor</span>
        {ORDINAL.map((c, i) => (
          <span key={c} className="flex flex-col items-center gap-1">
            <span className="block h-3 w-8 rounded-[var(--radius-mark)]" style={{ background: c }} />
            <span className="text-[10px]">{i === 0 ? "< 40" : `${STEPS[i]}+`}</span>
          </span>
        ))}
        <span>Mayor</span>
      </div>
    </div>
  );
}
