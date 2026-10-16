"use client";
/* Cifras: tarjeta de indicador (label · valor · delta · tendencia) y anillo de progreso. */
import { motion } from "framer-motion";
import { CountUp } from "@/components/motion";
import { T } from "@/design/motion-react";
import { Sparkline } from "./line";

export function StatTile({
  label,
  value,
  format,
  delta,
  goodWhen = "up",
  trend,
  tone = "light",
  icon,
}: {
  label: string;
  value: number;
  format?: (n: number) => string;
  /** Variación vs el período anterior, con su texto ("vs. ciclo anterior"). */
  delta?: { value: number; label: string; unit?: string };
  goodWhen?: "up" | "down";
  trend?: number[];
  tone?: "light" | "strong";
  icon?: React.ReactNode;
}) {
  const strong = tone === "strong";
  const good = delta ? (goodWhen === "up" ? delta.value >= 0 : delta.value <= 0) : true;
  return (
    <motion.article
      className={`grain relative overflow-hidden rounded-[var(--radius-card)] p-5 ${strong ? "bg-olive-800 text-cream" : "border border-line bg-white"}`}
      whileHover={{ y: -3 }}
      transition={T.ui}
    >
      <div className="relative z-[2] flex items-start justify-between gap-3">
        <p className={`text-app-small font-semibold ${strong ? "text-olive-300" : "text-ink-soft"}`}>{label}</p>
        {icon ? <span className={`grid size-9 place-items-center rounded-full ${strong ? "bg-rose-500 text-olive-900" : "bg-rose-100 text-olive-800"}`}>{icon}</span> : null}
      </div>
      <p className="relative z-[2] mt-3 font-body text-[2.1rem] font-semibold leading-none tracking-[-0.02em]">
        <CountUp value={value} format={format} />
      </p>
      <div className="relative z-[2] mt-3 flex items-end justify-between gap-2">
        {delta ? (
          <p className={`text-app-caption font-semibold ${strong ? "text-olive-100" : "text-ink-soft"}`}>
            <span aria-hidden="true" className={good ? (strong ? "text-rose-300" : "text-olive-600") : "text-rose-700"}>
              {delta.value >= 0 ? "▲" : "▼"}
            </span>{" "}
            {Math.abs(delta.value).toLocaleString("es-CO", { maximumFractionDigits: 1 })}
            {delta.unit ?? ""} {delta.label}
          </p>
        ) : (
          <span />
        )}
        {trend ? <Sparkline values={trend} color={strong ? "var(--rose-500)" : "var(--chart-highlight)"} /> : null}
      </div>
    </motion.article>
  );
}

/** Anillo de progreso animado (cercanía a certificación, cumplimiento). */
export function ProgressRing({
  value,
  size = 132,
  stroke = 12,
  label,
  sublabel,
  color = "var(--chart-series)",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <figure className="relative inline-grid place-items-center" style={{ width: size, height: size }} aria-label={`${label ?? ""} ${pct} %`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} style={{ stroke: "var(--chart-track)" }} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          style={{ stroke: color }}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - pct / 100) }}
          viewport={{ once: true }}
          transition={T.count}
        />
      </svg>
      <figcaption className="absolute inset-0 grid place-content-center text-center">
        <span className="font-display text-[1.9rem] leading-none tracking-[-0.04em]">
          <CountUp value={pct} suffix=" %" />
        </span>
        {sublabel ? <span className="mt-1 text-app-caption text-ink-soft">{sublabel}</span> : null}
      </figcaption>
    </figure>
  );
}
