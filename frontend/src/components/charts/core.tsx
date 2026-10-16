"use client";
/* Núcleo de gráficas (skill dataviz + GUIA_VISUAL §3.6).
   - Colores solo de tokens --chart-* (validados).
   - Texto con tokens de tinta, nunca con el color de la serie.
   - Toda gráfica tiene tooltip al pasar/enfocar y una vista de tabla. */
import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { T } from "@/design/motion-react";

/* ---------- medición responsiva ---------- */
export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e?.contentRect.width ?? 0)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

export const niceMax = (v: number) => {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
};
export const compact = (n: number) =>
  Math.abs(n) >= 1_000_000
    ? `${(n / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} M`
    : Math.abs(n) >= 1_000
      ? `${(n / 1_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} K`
      : n.toLocaleString("es-CO", { maximumFractionDigits: 1 });

/* ---------- tooltip ---------- */
type Tip = { x: number; y: number; title: string; rows: { label: string; value: string; color?: string; dash?: boolean }[] } | null;
const TipCtx = createContext<{ show: (t: NonNullable<Tip>) => void; hide: () => void } | null>(null);
export const useTooltip = () => {
  const c = useContext(TipCtx);
  if (!c) throw new Error("useTooltip fuera de <ChartCard>");
  return c;
};

/* ---------- tarjeta de gráfica ---------- */
export type TableColumn = { key: string; label: string; numeric?: boolean };
export function ChartCard({
  title,
  subtitle,
  legend,
  table,
  children,
  className = "",
  actions,
}: {
  title: string;
  subtitle?: string;
  legend?: ReactNode;
  /** Vista de tabla (accesibilidad: ningún valor depende del hover). */
  table?: { columns: TableColumn[]; rows: Record<string, string | number>[] };
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  const [tip, setTip] = useState<Tip>(null);
  const [asTable, setAsTable] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const show = useCallback((t: NonNullable<Tip>) => setTip(t), []);
  const hide = useCallback(() => setTip(null), []);
  return (
    <section className={`chart-card relative min-w-0 rounded-[var(--radius-card)] border border-line bg-white p-6 ${className}`}>
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[1.25rem] leading-tight tracking-[-0.02em]">{title}</h3>
          {subtitle ? <p className="mt-1 text-app-small text-ink-soft">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          {actions}
          {table ? (
            <button
              type="button"
              onClick={() => setAsTable((v) => !v)}
              className="shrink-0 whitespace-nowrap rounded-[var(--radius-pill)] border border-line px-3 py-1.5 text-app-caption font-semibold text-ink-soft transition-colors hover:bg-cream-200"
              aria-pressed={asTable}
            >
              {asTable ? "Ver gráfica" : "Ver tabla"}
            </button>
          ) : null}
        </div>
      </header>
      {legend ? <div className="mb-3">{legend}</div> : null}
      <TipCtx.Provider value={{ show, hide }}>
        <div ref={box} data-chart-host className="relative" onPointerLeave={hide}>
          {asTable && table ? <DataTable {...table} /> : children}
          <AnimatePresence>
            {tip && !asTable ? (
              <motion.div
                role="status"
                className="pointer-events-none absolute z-10 min-w-36 rounded-[var(--radius-control)] bg-olive-900 px-3 py-2 text-cream shadow-[var(--shadow-float)]"
                style={{ left: tip.x, top: tip.y }}
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={T.ui}
              >
                <p className="text-app-caption text-olive-300">{tip.title}</p>
                {tip.rows.map((r) => (
                  <p key={r.label} className="mt-1 flex items-center gap-2 text-app-small">
                    {r.color ? (
                      <span aria-hidden="true" className="inline-block h-[2px] w-3" style={{ background: r.color, borderTop: r.dash ? `2px dashed ${r.color}` : undefined }} />
                    ) : null}
                    <strong className="font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>{r.value}</strong>
                    <span className="text-olive-300">{r.label}</span>
                  </p>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </TipCtx.Provider>
    </section>
  );
}

/** Coloca el tooltip respecto del contenedor de la gráfica (data-chart-host). */
export function tipAt(e: React.PointerEvent | React.FocusEvent) {
  const target = e.currentTarget as Element;
  const host = target.closest("[data-chart-host]");
  const r = host?.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  const px = "clientX" in e ? e.clientX : t.left + t.width / 2;
  const py = "clientY" in e ? e.clientY : t.top;
  const w = r?.width ?? 0;
  const x = Math.max(0, Math.min(w - 170, px - (r?.left ?? 0) + 14));
  return { x, y: Math.max(-8, py - (r?.top ?? 0) - 70) };
}

export function DataTable({ columns, rows }: { columns: TableColumn[]; rows: Record<string, string | number>[] }) {
  return (
    <div className="max-h-80 overflow-auto rounded-[var(--radius-control)] border border-line">
      <table className="w-full border-collapse text-app-small">
        <thead className="sticky top-0 bg-cream-200 text-left">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={`px-3 py-2 font-semibold ${c.numeric ? "text-right" : ""}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line">
              {columns.map((c) => (
                <td key={c.key} className={`px-3 py-2 ${c.numeric ? "text-right" : ""}`} style={c.numeric ? { fontVariantNumeric: "tabular-nums" } : undefined}>
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- leyenda (≥ 2 series) ---------- */
export function Legend({ items }: { items: { label: string; color: string; shape?: "rect" | "line" | "circle" | "diamond" }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-app-caption text-ink-soft">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          <svg width="14" height="14" aria-hidden="true">
            {it.shape === "line" ? (
              <line x1="1" x2="13" y1="7" y2="7" strokeWidth="2" strokeLinecap="round" style={{ stroke: it.color }} />
            ) : it.shape === "circle" ? (
              <circle cx="7" cy="7" r="5" style={{ fill: it.color }} />
            ) : it.shape === "diamond" ? (
              <rect x="3" y="3" width="8" height="8" transform="rotate(45 7 7)" style={{ fill: it.color }} />
            ) : (
              <rect x="1" y="3" width="12" height="8" rx="2" style={{ fill: it.color }} />
            )}
          </svg>
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/** Colores de la rampa ordinal E1→E6. */
export const ORDINAL = Array.from({ length: 6 }, (_, i) => `var(--chart-ord-${i + 1})`);
