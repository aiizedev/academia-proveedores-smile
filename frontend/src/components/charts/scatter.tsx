"use client";
/* Matriz de riesgo (SPEC-DASH): score (x) vs volumen (y), segmento por color + forma,
   cuadrantes rotulados, área de toque ≥ 24 px por punto.
   Al cambiar los datos (filtros) los puntos se desplazan a su nueva posición y los
   que salen se desvanecen: la gráfica conserva su marco y no parpadea. */
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { EASING, GLIDE, T } from "@/design/motion-react";
import { compact, niceMax, tipAt, useMeasure, useTooltip } from "./core";

export type Point = { id: string; label: string; x: number; y: number; segment: "ESTRATEGICO" | "LOCAL"; meta?: string };

export const SEGMENT_COLOR = { ESTRATEGICO: "var(--chart-highlight)", LOCAL: "var(--chart-local)" } as const;

export function RiskMatrix({
  points,
  height = 360,
  xLabel = "Score de sostenibilidad",
  yLabel = "Volumen comprado (kg/mes)",
  yUnit = "kg/mes",
  xThreshold = 60,
  yMax,
  yScale = "linear",
  onSelect,
  selected,
}: {
  points: Point[];
  height?: number;
  xLabel?: string;
  yLabel?: string;
  /** Unidad del eje Y en el tooltip. */
  yUnit?: string;
  /** Umbral de score que separa riesgo (izquierda) de solidez (derecha). */
  xThreshold?: number;
  /** Tope fijo del eje Y (conserva la escala al filtrar). */
  yMax?: number;
  /** "sqrt" separa la cola larga de volúmenes pequeños (un solo eje, rotulado). */
  yScale?: "linear" | "sqrt";
  onSelect?: (id: string) => void;
  selected?: string | null;
}) {
  const tip = useTooltip();
  const { ref, width } = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<string | null>(null);
  const padL = 56;
  const padR = 16;
  const padT = 20;
  const padB = 40;
  const plotW = Math.max(0, width - padL - padR);
  const plotH = height - padT - padB;
  const yTop = yMax ?? niceMax(Math.max(1, ...points.map((p) => p.y)));
  const sqrt = yScale === "sqrt";
  const yMid = sqrt ? yTop / 4 : yTop / 2; // mitad visual del eje
  const X = (v: number) => padL + (v / 100) * plotW;
  const Y = (v: number) => padT + plotH - (sqrt ? Math.sqrt(Math.max(0, v) / yTop) : v / yTop) * plotH;
  const yTicks = sqrt ? [0, yTop / 20, yTop / 4, yTop / 2, yTop] : [0, yMid, yTop];
  const quads = [
    { x: 0, y0: yMid, y1: yTop, w: xThreshold, label: "Atender primero", tone: "var(--rose-100)" },
    { x: xThreshold, y0: yMid, y1: yTop, w: 100 - xThreshold, label: "Aliados estratégicos", tone: "var(--olive-25)" },
    { x: 0, y0: 0, y1: yMid, w: xThreshold, label: "Acompañar", tone: "var(--cream-200)" },
    { x: xThreshold, y0: 0, y1: yMid, w: 100 - xThreshold, label: "Mantener", tone: "var(--olive-25)" },
  ];
  const tipRows = (p: Point, color: string) => [
    { label: "score", value: String(p.x), color },
    { label: yUnit, value: compact(p.y) },
    ...(p.meta ? [{ label: "", value: p.meta }] : []),
  ];
  // El seleccionado se pinta al final (encima). No se reordena al pasar el puntero:
  // mover el nodo en el DOM entre pointerdown y pointerup anularía el clic.
  const ordered = [...points].sort((a, b) => Number(a.id === selected) - Number(b.id === selected));
  return (
    <div ref={ref} className="w-full">
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label="Matriz de riesgo de proveedores" className="overflow-visible">
          {quads.map((q) => (
            <g key={q.label}>
              <rect x={X(q.x)} y={Y(q.y1)} width={(q.w / 100) * plotW} height={Y(q.y0) - Y(q.y1)} style={{ fill: q.tone }} opacity="0.55" />
              <text x={X(q.x) + 10} y={Y(q.y1) + 18} className="fill-[var(--ink-soft)] text-[11px] font-semibold uppercase tracking-[0.08em]">
                {q.label}
              </text>
            </g>
          ))}
          <line x1={X(xThreshold)} x2={X(xThreshold)} y1={padT} y2={Y(0)} strokeWidth="1" style={{ stroke: "var(--chart-grid)" }} />
          <line x1={padL} x2={width - padR} y1={Y(yMid)} y2={Y(yMid)} strokeWidth="1" style={{ stroke: "var(--chart-grid)" }} />
          {[0, 20, 40, 60, 80, 100].map((t) => (
            <text key={t} x={X(t)} y={height - 22} textAnchor="middle" className="fill-[var(--ink-soft)] text-[11px]">
              {t}
            </text>
          ))}
          {yTicks.map((t, i) => (
            <text key={i} x={padL - 8} y={Y(t) + 4} textAnchor="end" className="fill-[var(--ink-soft)] text-[11px]">
              {compact(t)}
            </text>
          ))}
          <text x={padL + plotW / 2} y={height - 4} textAnchor="middle" className="fill-[var(--ink-soft)] text-[11px] font-semibold">
            {xLabel}
          </text>
          <text transform={`translate(12 ${padT + plotH / 2}) rotate(-90)`} textAnchor="middle" className="fill-[var(--ink-soft)] text-[11px] font-semibold">
            {yLabel}
          </text>
          <AnimatePresence initial={false}>
            {ordered.map((p, i) => {
              const cx = X(p.x);
              const cy = Y(p.y);
              const isSel = selected === p.id;
              const on = hover === p.id || isSel;
              const dim = selected && !isSel && hover !== p.id;
              const color = SEGMENT_COLOR[p.segment];
              const r = on ? 7 : 5;
              return (
                <motion.g
                  key={p.id}
                  initial={{ x: cx, y: cy, opacity: 0 }}
                  animate={{ x: cx, y: cy, opacity: dim ? 0.45 : 1 }}
                  exit={{ opacity: 0, transition: T.exit }}
                  transition={{ x: GLIDE, y: GLIDE, opacity: T.ui }}
                >
                  <motion.g
                    initial={{ scale: 0.4, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: T.pop.duration * 0.66, ease: EASING.pop, delay: 0.2 + i * 0.015 }}
                  >
                    {isSel ? (
                      <motion.circle
                        r="13"
                        fill="none"
                        strokeWidth="1.5"
                        style={{ stroke: "var(--ink)" }}
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={GLIDE}
                      />
                    ) : null}
                    {p.segment === "ESTRATEGICO" ? (
                      <rect x={-r} y={-r} width={r * 2} height={r * 2} transform="rotate(45)" strokeWidth="2" style={{ fill: color, stroke: "var(--white)" }} />
                    ) : (
                      <circle r={r} strokeWidth="2" style={{ fill: color, stroke: "var(--white)" }} />
                    )}
                    <circle
                      r="12"
                      fill="transparent"
                      tabIndex={0}
                      role="button"
                      aria-label={`${p.label}: score ${p.x}, ${compact(p.y)} ${yUnit}`}
                      aria-pressed={onSelect ? isSel : undefined}
                      className="cursor-pointer outline-none"
                      onPointerEnter={() => setHover(p.id)}
                      onPointerMove={(e) => tip.show({ ...tipAt(e), title: p.label, rows: tipRows(p, color) })}
                      onPointerLeave={() => setHover(null)}
                      onFocus={(e) => {
                        setHover(p.id);
                        tip.show({ ...tipAt(e), title: p.label, rows: tipRows(p, color) });
                      }}
                      onBlur={() => {
                        setHover(null);
                        tip.hide();
                      }}
                      onClick={() => onSelect?.(p.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelect?.(p.id);
                        }
                      }}
                    />
                  </motion.g>
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>
      ) : (
        <div style={{ height }} />
      )}
    </div>
  );
}
