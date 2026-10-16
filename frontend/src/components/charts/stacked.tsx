"use client";
/* Barras apiladas al 100 % (composición por fila, p. ej. etapas E1→E6 por ciclo).
   Marcas de 22 px, 2 px de superficie entre segmentos, puntas de 4 px en los extremos.
   Los colores los da quien llama (rampa ordinal o par categórico ya validados);
   se acompaña siempre de <Legend>. */
import { motion } from "framer-motion";
import { STAGGER, T } from "@/design/motion-react";
import { tipAt, useTooltip } from "./core";

export type StackRow = { id: string; label: string; segments: { id: string; label: string; value: number; color: string }[] };

export function StackedBars({ rows, unit = "" }: { rows: StackRow[]; unit?: string }) {
  const tip = useTooltip();
  return (
    <ul className="grid gap-4">
      {rows.map((row, ri) => {
        const total = row.segments.reduce((a, s) => a + s.value, 0) || 1;
        const visible = row.segments.filter((s) => s.value > 0);
        return (
          <li key={row.id} className="grid grid-cols-[minmax(5rem,18%)_1fr_3.5rem] items-center gap-3">
            <span className="truncate text-app-small font-semibold">{row.label}</span>
            <span className="flex h-[22px] gap-[2px] overflow-hidden rounded-[var(--radius-mark)] bg-[var(--chart-track)]">
              {visible.map((s, si) => {
                const pct = (s.value / total) * 100;
                const show = (e: React.PointerEvent | React.FocusEvent) =>
                  tip.show({ ...tipAt(e), title: `${row.label} · ${s.label}`, rows: [{ label: unit, value: `${s.value} (${Math.round(pct)} %)`, color: s.color }] });
                return (
                  <motion.span
                    key={s.id}
                    tabIndex={0}
                    aria-label={`${row.label}, ${s.label}: ${s.value}${unit ? ` ${unit}` : ""}`}
                    className="block h-full outline-none first:rounded-l-[var(--radius-mark)] last:rounded-r-[var(--radius-mark)]"
                    style={{ background: s.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ ...T.bar, delay: ri * STAGGER.base + si * STAGGER.tight }}
                    onPointerMove={show}
                    onFocus={show}
                    onBlur={tip.hide}
                  />
                );
              })}
            </span>
            <span className="text-right text-app-small font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
              {total === 1 && row.segments.every((s) => s.value === 0) ? 0 : total}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
