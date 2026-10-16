"use client";
/* Barras horizontales, columnas y funnel (marcas: ≤ 24 px, punta 4 px, crecen desde la base). */
import { motion } from "framer-motion";
import { T, STAGGER } from "@/design/motion-react";
import { compact, niceMax, ORDINAL, tipAt, useMeasure, useTooltip } from "./core";

export type BarDatum = { id: string; label: string; value: number; display?: string; highlight?: boolean; hint?: string };
export type Reference = { value: number; label: string };

/** Ranking/magnitud por categoría. Una sola serie: un solo color (énfasis opcional). */
export function BarList({
  data,
  max,
  unit = "",
  onSelect,
  selected,
}: {
  data: BarDatum[];
  max?: number;
  unit?: string;
  onSelect?: (id: string) => void;
  selected?: string | null;
}) {
  const tip = useTooltip();
  const top = max ?? niceMax(Math.max(...data.map((d) => d.value)));
  return (
    <div className="relative">
      <ul className="grid gap-3">
        {data.map((d, i) => {
          const pct = (d.value / top) * 100;
          const dim = selected && selected !== d.id;
          return (
            <li key={d.id}>
              <button
                type="button"
                className="group grid w-full grid-cols-[minmax(7rem,30%)_1fr_auto] items-center gap-3 rounded-[var(--radius-control)] px-1 py-1 text-left transition-colors hover:bg-cream"
                style={{ opacity: dim ? 0.45 : 1 }}
                onClick={() => onSelect?.(d.id)}
                onPointerMove={(e) => tip.show({ ...tipAt(e), title: d.label, rows: [{ label: d.hint ?? unit, value: d.display ?? `${compact(d.value)}${unit}` }] })}
                onFocus={(e) => tip.show({ ...tipAt(e), title: d.label, rows: [{ label: d.hint ?? unit, value: d.display ?? `${compact(d.value)}${unit}` }] })}
                onBlur={tip.hide}
                aria-label={`${d.label}: ${d.display ?? d.value + unit}`}
              >
                <span className="truncate text-app-small font-semibold">{d.label}</span>
                <span className="relative h-[14px] rounded-[var(--radius-pill)] bg-[var(--chart-track)]">
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-l-[var(--radius-pill)] rounded-r-[var(--radius-mark)]"
                    style={{ background: d.highlight ? "var(--chart-highlight)" : "var(--chart-series)" }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ ...T.bar, delay: i * STAGGER.base }}
                  />
                </span>
                <span className="min-w-14 text-right text-app-small font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {d.display ?? `${compact(d.value)}${unit}`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Columnas verticales (serie temporal corta o categorías ordenadas). */
export function ColumnChart({
  data,
  height = 220,
  unit = "",
  ordinal = false,
  references = [],
}: {
  data: BarDatum[];
  height?: number;
  unit?: string;
  /** true: cada columna toma un paso de la rampa E1→E6 (categorías ordinales). */
  ordinal?: boolean;
  references?: Reference[];
}) {
  const tip = useTooltip();
  const { ref, width } = useMeasure<HTMLDivElement>();
  const top = niceMax(Math.max(...data.map((d) => d.value), ...references.map((r) => r.value)));
  const padL = 36;
  const padB = 28;
  const plotW = Math.max(0, width - padL);
  const plotH = height - padB - 16;
  const band = plotW / Math.max(1, data.length);
  const bw = Math.min(24, band * 0.55);
  const y = (v: number) => 16 + plotH - (v / top) * plotH;
  const ticks = [0, 0.5, 1].map((f) => f * top);
  return (
    <div ref={ref} className="w-full">
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label="Gráfica de columnas">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} x2={width} y1={y(t)} y2={y(t)} strokeWidth="1" style={{ stroke: "var(--chart-grid)" }} />
              <text x={padL - 8} y={y(t) + 4} textAnchor="end" className="fill-[var(--ink-soft)] text-[11px]">
                {compact(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = padL + band * i + band / 2;
            const h = (d.value / top) * plotH;
            const color = d.highlight ? "var(--chart-highlight)" : ordinal ? ORDINAL[Math.min(5, i)] : "var(--chart-series)";
            const label = d.display ?? `${compact(d.value)}${unit}`;
            return (
              <g key={d.id}>
                <rect
                  x={cx - band / 2}
                  y={16}
                  width={band}
                  height={plotH + padB - 12}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`${d.label}: ${label}`}
                  onPointerMove={(e) => tip.show({ ...tipAt(e), title: d.label, rows: [{ label: d.hint ?? unit, value: label }] })}
                  onFocus={(e) => tip.show({ ...tipAt(e), title: d.label, rows: [{ label: d.hint ?? unit, value: label }] })}
                  onBlur={tip.hide}
                  className="cursor-default outline-none"
                />
                <motion.path
                  d={columnPath(cx - bw / 2, y(0), bw, h)}
                  style={{ fill: color, transformOrigin: `${cx}px ${y(0)}px` }}
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ ...T.bar, delay: i * STAGGER.tight }}
                  pointerEvents="none"
                />
                <text x={cx} y={y(d.value) - 6} textAnchor="middle" className="fill-[var(--ink)] text-[11px] font-bold">
                  {label}
                </text>
                <text x={cx} y={height - 8} textAnchor="middle" className="fill-[var(--ink-soft)] text-[11px]">
                  {d.label}
                </text>
              </g>
            );
          })}
          {references.map((r) => (
            <g key={r.label} pointerEvents="none">
              <line x1={padL} x2={width} y1={y(r.value)} y2={y(r.value)} strokeWidth="1.5" strokeDasharray="5 4" style={{ stroke: "var(--chart-reference)" }} />
              <text x={width - 4} y={y(r.value) - 6} textAnchor="end" className="fill-[var(--rose-700)] text-[11px] font-semibold">
                {r.label}
              </text>
            </g>
          ))}
        </svg>
      ) : (
        <div style={{ height }} />
      )}
    </div>
  );
}

/** Rectángulo con punta superior redondeada (4 px) y base recta. */
function columnPath(x: number, base: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h);
  const top = base - h;
  return `M${x},${base} V${top + r} Q${x},${top} ${x + r},${top} H${x + w - r} Q${x + w},${top} ${x + w},${top + r} V${base} Z`;
}

export type Stage = { id: string; label: string; short: string; count: number };
/** Funnel de 6 etapas (ordinal): barra por etapa + conversión respecto de la anterior. Interactivo. */
export function FunnelChart({ stages, onSelect, selected }: { stages: Stage[]; onSelect?: (id: string | null) => void; selected?: string | null }) {
  const tip = useTooltip();
  const max = Math.max(...stages.map((s) => s.count), 1);
  const total = stages.reduce((a, s) => a + s.count, 0);
  return (
    <ol className="grid gap-2" aria-label="Funnel de maduración">
      {stages.map((s, i) => {
        const prev = stages[i - 1];
        const conv = prev && prev.count > 0 ? Math.round((s.count / prev.count) * 100) : null;
        const active = selected === s.id;
        const dim = selected && !active;
        return (
          <li key={s.id}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onSelect?.(active ? null : s.id)}
              onPointerMove={(e) =>
                tip.show({
                  ...tipAt(e),
                  title: `${s.short} · ${s.label}`,
                  rows: [
                    { label: "proveedores", value: String(s.count), color: ORDINAL[i] },
                    { label: "del total", value: `${Math.round((s.count / Math.max(1, total)) * 100)} %` },
                  ],
                })
              }
              onBlur={tip.hide}
              className="group grid w-full grid-cols-[3.2rem_1fr_4.5rem] items-center gap-3 rounded-[var(--radius-control)] p-1 text-left transition-[opacity,background-color] hover:bg-cream"
              style={{ opacity: dim ? 0.4 : 1 }}
            >
              <span className="text-app-caption font-bold text-ink-soft">{s.short}</span>
              <span className="relative block h-10">
                <motion.span
                  className="absolute inset-y-0 left-0 flex items-center rounded-[var(--radius-control)] px-3 text-app-small font-semibold"
                  style={{ background: ORDINAL[i], color: i >= 3 ? "var(--cream)" : "var(--olive-900)" }}
                  initial={{ width: "0%" }}
                  whileInView={{ width: `${Math.max(14, (s.count / max) * 100)}%` }}
                  viewport={{ once: true }}
                  transition={{ ...T.bar, delay: i * STAGGER.base }}
                >
                  <span className="truncate">{s.label}</span>
                </motion.span>
              </span>
              <span className="text-right">
                <strong className="block text-[1.05rem] leading-none" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {s.count}
                </strong>
                <span className="text-app-caption text-ink-soft">{conv === null ? "inicio" : `${conv} % pasa`}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
