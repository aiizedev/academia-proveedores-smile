"use client";
/* Línea temporal con cruz de lectura, área al 10 % y líneas de meta; y sparkline. */
import { motion } from "framer-motion";
import { useState } from "react";
import { T } from "@/design/motion-react";
import { compact, niceMax, tipAt, useMeasure, useTooltip, type TableColumn } from "./core";
import type { Reference } from "./bars";

export type Series = { id: string; label: string; color: string; values: number[] };

export function LineChart({
  labels,
  series,
  height = 240,
  unit = "",
  references = [],
  yMax,
}: {
  labels: string[];
  series: Series[];
  height?: number;
  unit?: string;
  references?: Reference[];
  yMax?: number;
}) {
  const tip = useTooltip();
  const { ref, width } = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const top = yMax ?? niceMax(Math.max(...series.flatMap((s) => s.values), ...references.map((r) => r.value)));
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const plotW = Math.max(0, width - padL - padR);
  const plotH = height - padT - padB;
  const x = (i: number) => padL + (labels.length <= 1 ? plotW / 2 : (i / (labels.length - 1)) * plotW);
  const y = (v: number) => padT + plotH - (v / top) * plotH;
  const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const area = (vals: number[]) => `${path(vals)} L${x(vals.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * top);
  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left) / r.width) * (labels.length - 1));
    const idx = Math.max(0, Math.min(labels.length - 1, i));
    setHover(idx);
    tip.show({
      ...tipAt(e),
      title: labels[idx] ?? "",
      rows: series.map((s) => ({ label: s.label, value: `${compact(s.values[idx] ?? 0)}${unit}`, color: s.color })),
    });
  };
  return (
    <div ref={ref} className="w-full">
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label={series.map((s) => s.label).join(", ")}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} x2={width - padR} y1={y(t)} y2={y(t)} strokeWidth="1" style={{ stroke: "var(--chart-grid)" }} />
              <text x={padL - 8} y={y(t) + 4} textAnchor="end" className="fill-[var(--ink-soft)] text-[11px]">
                {compact(t)}
                {unit}
              </text>
            </g>
          ))}
          {labels.map((l, i) =>
            labels.length <= 8 || i % Math.ceil(labels.length / 8) === 0 ? (
              <text key={l} x={x(i)} y={height - 8} textAnchor="middle" className="fill-[var(--ink-soft)] text-[11px]">
                {l}
              </text>
            ) : null,
          )}
          {references.map((r) => (
            <g key={r.label}>
              <line x1={padL} x2={width - padR} y1={y(r.value)} y2={y(r.value)} strokeWidth="1.5" strokeDasharray="5 4" style={{ stroke: "var(--chart-reference)" }} />
              <text x={width - padR} y={y(r.value) - 6} textAnchor="end" className="fill-[var(--rose-700)] text-[11px] font-semibold">
                {r.label}
              </text>
            </g>
          ))}
          {series.map((s) => (
            <g key={s.id}>
              {series.length === 1 ? (
                <motion.path d={area(s.values)} style={{ fill: s.color, opacity: 0.1 }} initial={{ opacity: 0 }} whileInView={{ opacity: 0.1 }} viewport={{ once: true }} transition={T.bar} />
              ) : null}
              <motion.path
                d={path(s.values)}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ stroke: s.color }}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={T.bar}
              />
              <circle cx={x(s.values.length - 1)} cy={y(s.values[s.values.length - 1] ?? 0)} r="4.5" strokeWidth="2" style={{ fill: s.color, stroke: "var(--white)" }} />
            </g>
          ))}
          {hover !== null ? (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={padT} y2={y(0)} strokeWidth="1" style={{ stroke: "var(--ink-faint)" }} />
              {series.map((s) => (
                <circle key={s.id} cx={x(hover)} cy={y(s.values[hover] ?? 0)} r="4.5" strokeWidth="2" style={{ fill: s.color, stroke: "var(--white)" }} />
              ))}
            </g>
          ) : null}
          <rect
            x={padL}
            y={padT}
            width={plotW}
            height={plotH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => {
              setHover(null);
              tip.hide();
            }}
          />
        </svg>
      ) : (
        <div style={{ height }} />
      )}
    </div>
  );
}

export const lineTable = (labels: string[], series: Series[], unit = ""): { columns: TableColumn[]; rows: Record<string, string>[] } => ({
  columns: [{ key: "x", label: "Período" }, ...series.map((s) => ({ key: s.id, label: s.label, numeric: true }))],
  rows: labels.map((l, i) => ({ x: l, ...Object.fromEntries(series.map((s) => [s.id, `${compact(s.values[i] ?? 0)}${unit}`])) })),
});

/** Tendencia mínima para tarjetas de indicador (sin ejes). */
export function Sparkline({ values, width = 96, height = 28, color = "var(--chart-series)" }: { values: number[]; width?: number; height?: number; color?: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / Math.max(1, values.length - 1)) * (width - 4) + 2, height - 3 - ((v - min) / span) * (height - 6)]);
  const d = pts.map(([px, py], i) => `${i ? "L" : "M"}${px},${py}`).join(" ");
  const [lx, ly] = pts[pts.length - 1] ?? [0, 0];
  return (
    <svg width={width} height={height} aria-hidden="true">
      <motion.path d={d} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--olive-300)" }} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={T.bar} />
      <circle cx={lx} cy={ly} r="3.5" style={{ fill: color }} />
    </svg>
  );
}
