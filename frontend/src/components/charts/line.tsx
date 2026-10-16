"use client";
/* Línea temporal con cruz de lectura, área al 10 % y líneas de meta; y sparkline.
   Cuando cambian los datos (filtros) la línea se transforma hacia la nueva forma
   en lugar de redibujarse: el marco se conserva y no hay parpadeo. */
import { motion } from "framer-motion";
import { useState } from "react";
import { T } from "@/design/motion-react";
import { compact, niceMax, tipAt, useMeasure, useTooltip, type TableColumn } from "./core";
import type { Reference } from "./bars";

/** `null` = sin dato en ese período (la línea se corta). */
export type Series = { id: string; label: string; color: string; values: Array<number | null>; dash?: boolean };

const MORPH = { duration: T.reveal.duration, ease: T.reveal.ease };

export function LineChart({
  labels,
  series,
  height = 240,
  unit = "",
  references = [],
  yMax,
  yMin = 0,
  band,
  refLabelAt = "end",
}: {
  labels: string[];
  series: Series[];
  height?: number;
  unit?: string;
  references?: Reference[];
  yMax?: number;
  /** Piso del eje Y (por defecto 0). Solo para líneas: las barras siempre parten de 0. */
  yMin?: number;
  /** Dónde rotular las líneas de referencia ("start" si la serie termina cerca de la meta). */
  refLabelAt?: "start" | "end";
  /** Franja de períodos resaltada (p. ej. el ciclo elegido en el filtro). */
  band?: { from: number; to: number; label?: string } | null;
}) {
  const tip = useTooltip();
  const { ref, width } = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const nums = series.flatMap((s) => s.values.filter((v): v is number => v !== null));
  const top = yMax ?? niceMax(Math.max(1, ...nums, ...references.map((r) => r.value)));
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const plotW = Math.max(0, width - padL - padR);
  const plotH = height - padT - padB;
  const step = labels.length <= 1 ? 0 : plotW / (labels.length - 1);
  const x = (i: number) => padL + (labels.length <= 1 ? plotW / 2 : i * step);
  const y = (v: number) => padT + plotH - ((Math.max(yMin, v) - yMin) / Math.max(1e-9, top - yMin)) * plotH;
  const path = (vals: Array<number | null>) => {
    let pen = false;
    return vals
      .map((v, i) => {
        if (v === null) {
          pen = false;
          return "";
        }
        const cmd = `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
        pen = true;
        return cmd;
      })
      .join(" ")
      .trim();
  };
  const area = (vals: Array<number | null>) => {
    const first = vals.findIndex((v) => v !== null);
    const last = vals.length - 1 - [...vals].reverse().findIndex((v) => v !== null);
    if (first < 0 || vals.slice(first, last + 1).some((v) => v === null)) return "";
    return `${path(vals)} L${x(last).toFixed(1)},${y(yMin).toFixed(1)} L${x(first).toFixed(1)},${y(yMin).toFixed(1)} Z`;
  };
  const lastPoint = (vals: Array<number | null>) => {
    for (let i = vals.length - 1; i >= 0; i -= 1) {
      const v = vals[i];
      if (v !== null && v !== undefined) return { i, v };
    }
    return null;
  };
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => yMin + f * (top - yMin));
  const fmt = (v: number | null | undefined) => (v === null || v === undefined ? "sin dato" : `${compact(v)}${unit}`);
  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left) / r.width) * (labels.length - 1));
    const idx = Math.max(0, Math.min(labels.length - 1, i));
    setHover(idx);
    tip.show({
      ...tipAt(e),
      title: labels[idx] ?? "",
      rows: series.map((s) => ({ label: s.label, value: fmt(s.values[idx]), color: s.color, dash: s.dash })),
    });
  };
  return (
    <div ref={ref} className="w-full">
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label={series.map((s) => s.label).join(", ")}>
          {band ? (
            <g pointerEvents="none">
              <motion.rect
                y={padT}
                height={plotH}
                initial={false}
                animate={{ x: x(band.from) - step / 2, width: Math.max(step, x(band.to) - x(band.from) + step) }}
                transition={MORPH}
                style={{ fill: "var(--rose-100)" }}
                opacity="0.6"
              />
              {band.label ? (
                <motion.text
                  y={padT + 12}
                  initial={false}
                  animate={{ x: x(band.from) - step / 2 + 8 }}
                  transition={MORPH}
                  className="fill-[var(--rose-700)] text-[11px] font-semibold"
                >
                  {band.label}
                </motion.text>
              ) : null}
            </g>
          ) : null}
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
            labels.length <= 12 || i % Math.ceil(labels.length / 12) === 0 ? (
              <text key={`${l}-${i}`} x={x(i)} y={height - 8} textAnchor="middle" className="fill-[var(--ink-soft)] text-[11px]">
                {l}
              </text>
            ) : null,
          )}
          {references.map((r) => (
            <g key={r.label}>
              <line x1={padL} x2={width - padR} y1={y(r.value)} y2={y(r.value)} strokeWidth="1.5" strokeDasharray="5 4" style={{ stroke: "var(--chart-reference)" }} />
              <text x={refLabelAt === "start" ? padL + 6 : width - padR} y={y(r.value) - 6} textAnchor={refLabelAt === "start" ? "start" : "end"} className="fill-[var(--rose-700)] text-[11px] font-semibold">
                {r.label}
              </text>
            </g>
          ))}
          {series.map((s) => {
            const d = path(s.values);
            const a = area(s.values);
            const lp = lastPoint(s.values);
            return (
              <g key={s.id}>
                {series.length === 1 && a ? (
                  <motion.path
                    initial={{ opacity: 0, d: a }}
                    whileInView={{ opacity: 0.1 }}
                    animate={{ d: a }}
                    viewport={{ once: true }}
                    transition={{ opacity: T.bar, d: MORPH }}
                    style={{ fill: s.color }}
                  />
                ) : null}
                {s.dash ? (
                  // Serie de comparación (ciclo anterior): discontinua, sin trazo animado.
                  <motion.path
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="6 5"
                    style={{ stroke: s.color }}
                    initial={{ opacity: 0, d }}
                    animate={{ opacity: 1, d }}
                    transition={{ opacity: T.reveal, d: MORPH }}
                  />
                ) : (
                  <motion.path
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ stroke: s.color }}
                    initial={{ pathLength: 0, d }}
                    whileInView={{ pathLength: 1 }}
                    animate={{ d }}
                    viewport={{ once: true }}
                    transition={{ pathLength: T.bar, d: MORPH }}
                  />
                )}
                {lp ? (
                  <motion.circle
                    r="4.5"
                    strokeWidth="2"
                    style={{ fill: s.color, stroke: "var(--white)" }}
                    initial={{ cx: x(lp.i), cy: y(lp.v) }}
                    animate={{ cx: x(lp.i), cy: y(lp.v) }}
                    transition={MORPH}
                  />
                ) : null}
              </g>
            );
          })}
          {hover !== null ? (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={padT} y2={y(yMin)} strokeWidth="1" style={{ stroke: "var(--ink-faint)" }} />
              {series.map((s) => {
                const v = s.values[hover];
                return v === null || v === undefined ? null : (
                  <circle key={s.id} cx={x(hover)} cy={y(v)} r="4.5" strokeWidth="2" style={{ fill: s.color, stroke: "var(--white)" }} />
                );
              })}
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
  rows: labels.map((l, i) => ({
    x: l,
    ...Object.fromEntries(series.map((s) => {
      const v = s.values[i];
      return [s.id, v === null || v === undefined ? "—" : `${compact(v)}${unit}`];
    })),
  })),
});

/** Tendencia mínima para tarjetas de indicador (sin ejes). */
export function Sparkline({ values, width = 96, height = 28, color = "var(--chart-series)" }: { values: number[]; width?: number; height?: number; color?: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / Math.max(1, values.length - 1)) * (width - 4) + 2, height - 3 - ((v - min) / span) * (height - 6)]);
  const d = pts.map(([px, py], i) => `${i ? "L" : "M"}${(px ?? 0).toFixed(1)},${(py ?? 0).toFixed(1)}`).join(" ");
  const [lx, ly] = pts[pts.length - 1] ?? [0, 0];
  return (
    <svg width={width} height={height} aria-hidden="true" className="overflow-visible">
      <motion.path
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: "var(--olive-300)" }}
        initial={{ pathLength: 0, d }}
        whileInView={{ pathLength: 1 }}
        animate={{ d }}
        viewport={{ once: true }}
        transition={{ pathLength: T.bar, d: MORPH }}
      />
      <motion.circle r="3.5" style={{ fill: color }} initial={{ cx: lx, cy: ly }} animate={{ cx: lx, cy: ly }} transition={MORPH} />
    </svg>
  );
}
