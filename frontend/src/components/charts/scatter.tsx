"use client";
/* Matriz de riesgo (SPEC-DASH): score (x) vs volumen (y), segmento por color + forma,
   cuadrantes rotulados, área de toque ≥ 24 px por punto. */
import { motion } from "framer-motion";
import { useState } from "react";
import { EASING } from "@/design/motion-react";
import { compact, niceMax, tipAt, useMeasure, useTooltip } from "./core";

export type Point = { id: string; label: string; x: number; y: number; segment: "ESTRATEGICO" | "LOCAL"; meta?: string };

export const SEGMENT_COLOR = { ESTRATEGICO: "var(--chart-highlight)", LOCAL: "var(--chart-local)" } as const;

export function RiskMatrix({
  points,
  height = 360,
  xLabel = "Score de sostenibilidad",
  yLabel = "Volumen comprado (kg/mes)",
  xThreshold = 60,
  onSelect,
  selected,
}: {
  points: Point[];
  height?: number;
  xLabel?: string;
  yLabel?: string;
  /** Umbral de score que separa riesgo (izquierda) de solidez (derecha). */
  xThreshold?: number;
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
  const yTop = niceMax(Math.max(...points.map((p) => p.y)));
  const yMid = yTop / 2;
  const X = (v: number) => padL + (v / 100) * plotW;
  const Y = (v: number) => padT + plotH - (v / yTop) * plotH;
  const quads = [
    { x: 0, y: yMid, w: xThreshold, h: yTop - yMid, label: "Atender primero", tone: "var(--rose-100)" },
    { x: xThreshold, y: yMid, w: 100 - xThreshold, h: yTop - yMid, label: "Aliados estratégicos", tone: "var(--olive-25)" },
    { x: 0, y: 0, w: xThreshold, h: yMid, label: "Acompañar", tone: "var(--cream-200)" },
    { x: xThreshold, y: 0, w: 100 - xThreshold, h: yMid, label: "Mantener", tone: "var(--olive-25)" },
  ];
  return (
    <div ref={ref} className="w-full">
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label="Matriz de riesgo de proveedores">
          {quads.map((q) => (
            <g key={q.label}>
              <rect x={X(q.x)} y={Y(q.y + q.h)} width={(q.w / 100) * plotW} height={(q.h / yTop) * plotH} style={{ fill: q.tone }} opacity="0.55" />
              <text x={X(q.x) + 10} y={Y(q.y + q.h) + 18} className="fill-[var(--ink-soft)] text-[11px] font-semibold uppercase tracking-[0.08em]">
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
          {[0, yMid, yTop].map((t) => (
            <text key={t} x={padL - 8} y={Y(t) + 4} textAnchor="end" className="fill-[var(--ink-soft)] text-[11px]">
              {compact(t)}
            </text>
          ))}
          <text x={padL + plotW / 2} y={height - 4} textAnchor="middle" className="fill-[var(--ink-soft)] text-[11px] font-semibold">
            {xLabel}
          </text>
          <text transform={`translate(12 ${padT + plotH / 2}) rotate(-90)`} textAnchor="middle" className="fill-[var(--ink-soft)] text-[11px] font-semibold">
            {yLabel}
          </text>
          {points.map((p, i) => {
            const cx = X(p.x);
            const cy = Y(p.y);
            const on = hover === p.id || selected === p.id;
            const color = SEGMENT_COLOR[p.segment];
            const r = on ? 7 : 5;
            return (
              <motion.g
                key={p.id}
                initial={{ opacity: 0, scale: 0.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASING.pop, delay: 0.2 + i * 0.015 }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              >
                {p.segment === "ESTRATEGICO" ? (
                  <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} transform={`rotate(45 ${cx} ${cy})`} strokeWidth="2" style={{ fill: color, stroke: "var(--white)" }} />
                ) : (
                  <circle cx={cx} cy={cy} r={r} strokeWidth="2" style={{ fill: color, stroke: "var(--white)" }} />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r="12"
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={`${p.label}: score ${p.x}, ${compact(p.y)} kg/mes`}
                  className="cursor-pointer outline-none"
                  onPointerEnter={() => setHover(p.id)}
                  onPointerMove={(e) =>
                    tip.show({
                      ...tipAt(e),
                      title: p.label,
                      rows: [
                        { label: "score", value: String(p.x), color },
                        { label: "kg/mes", value: compact(p.y) },
                        ...(p.meta ? [{ label: "", value: p.meta }] : []),
                      ],
                    })
                  }
                  onPointerLeave={() => setHover(null)}
                  onFocus={(e) => {
                    setHover(p.id);
                    tip.show({ ...tipAt(e), title: p.label, rows: [{ label: "score", value: String(p.x), color }] });
                  }}
                  onBlur={() => setHover(null)}
                  onClick={() => onSelect?.(p.id)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.(p.id)}
                />
              </motion.g>
            );
          })}
        </svg>
      ) : (
        <div style={{ height }} />
      )}
    </div>
  );
}
