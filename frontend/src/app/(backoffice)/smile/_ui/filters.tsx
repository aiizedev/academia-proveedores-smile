"use client";
/* Filtros globales del back-office (regla dataviz: una fila encima de las gráficas).
   El estado vive en el layout (persiste al navegar entre tableros) y se refleja en la
   URL con history.replaceState (?ciclo=…&cat=…&seg=…&mun=…): se puede compartir el
   enlace y no hay navegación ni recarga al cambiar un filtro. */
import { LayoutGroup, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { GLIDE, T } from "@/design/motion-react";
import { cn } from "@/lib/cn";
import { CATEGORIES, CYCLES, MUNICIPALITIES, SUPPLIERS, type CycleId, type Segment } from "@/mocks/smile";
import { DEFAULT_FILTERS, type Filters } from "./data";

type Ctx = { filters: Filters; set: (patch: Partial<Filters>) => void; reset: () => void; ready: boolean };
const FiltersCtx = createContext<Ctx | null>(null);

const KEYS = { cycle: "ciclo", category: "cat", segment: "seg", municipality: "mun" } as const;

function parse(search: string): Filters {
  const q = new URLSearchParams(search);
  const cycle = q.get(KEYS.cycle);
  const seg = q.get(KEYS.segment);
  return {
    cycle: CYCLES.some((c) => c.id === cycle) ? (cycle as CycleId) : DEFAULT_FILTERS.cycle,
    category: q.get(KEYS.category) ?? "",
    segment: seg === "ESTRATEGICO" || seg === "LOCAL" ? (seg as Segment) : "",
    municipality: q.get(KEYS.municipality) ?? "",
  };
}

function write(f: Filters) {
  const q = new URLSearchParams(window.location.search);
  (Object.keys(KEYS) as Array<keyof Filters>).forEach((k) => {
    const v = f[k];
    if (v && v !== DEFAULT_FILTERS[k]) q.set(KEYS[k], v);
    else q.delete(KEYS[k]);
  });
  const qs = q.toString();
  const url = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
  if (url !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(window.history.state, "", url);
}

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    setFilters(parse(window.location.search));
    setReady(true);
  }, []);
  // Al navegar con el menú (sin query) la URL vuelve a mostrar los filtros vigentes.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    write(filters);
  }, [filters, pathname]);

  const set = useCallback((patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch })), []);
  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), []);
  const value = useMemo(() => ({ filters, set, reset, ready }), [filters, set, reset, ready]);
  return <FiltersCtx.Provider value={value}>{children}</FiltersCtx.Provider>;
}

export function useFilters() {
  const c = useContext(FiltersCtx);
  if (!c) throw new Error("useFilters fuera de <FiltersProvider>");
  return c;
}

/* ---------- Barra de filtros ---------- */
function Segmented<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  caption,
}: {
  id: string;
  label: string;
  caption?: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: ReactNode; title?: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-1 rounded-[var(--radius-pill)] border border-line bg-white p-1">
      {caption ? <span className="pr-1 pl-3 text-app-small font-semibold text-ink-soft">{caption}</span> : null}
      <LayoutGroup id={id}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              title={o.title}
              onClick={() => onChange(o.value)}
              className={cn("relative flex h-9 items-center gap-1.5 rounded-[var(--radius-pill)] px-3.5 text-app-small font-bold transition-colors", on ? "text-cream" : "text-ink-soft hover:text-ink")}
            >
              {on ? <motion.span layoutId="pill" transition={GLIDE} className="absolute inset-0 rounded-[var(--radius-pill)] bg-olive-800" /> : null}
              <span className="relative flex items-center gap-1.5 whitespace-nowrap">{o.label}</span>
            </button>
          );
        })}
      </LayoutGroup>
    </div>
  );
}

function SelectPill({ label, value, onChange, options, all }: { label: string; value: string; onChange: (v: string) => void; options: ReadonlyArray<{ value: string; label: string; hint?: string }>; all: string }) {
  const active = value !== "";
  return (
    <label className={cn("relative flex h-11 items-center gap-2 rounded-[var(--radius-pill)] border pr-8 pl-3.5 text-app-small transition-colors", active ? "border-transparent bg-rose-100" : "border-line bg-white hover:bg-cream")}>
      <span className="font-semibold text-ink-soft">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field-sizing-content appearance-none bg-transparent font-bold text-ink outline-none" aria-label={label}>
        <option value="">{all}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
            {o.hint ? ` · ${o.hint}` : ""}
          </option>
        ))}
      </select>
      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" className="pointer-events-none absolute right-3.5 text-ink-soft" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </label>
  );
}

export const SegmentGlyph = ({ segment, size = 10 }: { segment: Segment; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden="true" className="shrink-0">
    {segment === "ESTRATEGICO" ? (
      <rect x="1.8" y="1.8" width="6.4" height="6.4" transform="rotate(45 5 5)" style={{ fill: "var(--chart-highlight)" }} />
    ) : (
      <circle cx="5" cy="5" r="4" style={{ fill: "var(--chart-local)" }} />
    )}
  </svg>
);

export function FilterBar({ count }: { count?: number }) {
  const { filters, set, reset } = useFilters();
  const dirty = filters.category || filters.segment || filters.municipality || filters.cycle !== DEFAULT_FILTERS.cycle;
  const munOptions = MUNICIPALITIES.map((m) => ({ value: m, label: m, hint: SUPPLIERS.find((s) => s.municipality === m)?.department }));
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={T.enter}
      className="sticky top-0 z-[var(--z-status)] -mx-3 mb-6 flex flex-wrap items-center gap-2 rounded-[var(--radius-dock)] bg-cream/85 px-3 py-3 [backdrop-filter:var(--blur-dock)]"
      role="search"
      aria-label="Filtros del tablero"
    >
      <Segmented
        id="f-cycle"
        label="Ciclo"
        caption="Ciclo"
        value={filters.cycle}
        onChange={(v) => set({ cycle: v })}
        options={CYCLES.map((c) => ({ value: c.id, label: c.short, title: `${c.label}${c.id === "C3-2026" ? " (en curso)" : ""}` }))}
      />
      <SelectPill label="Categoría" value={filters.category} onChange={(v) => set({ category: v })} options={CATEGORIES.map((c) => ({ value: c.code, label: c.label }))} all="Todas" />
      <Segmented
        id="f-seg"
        label="Segmento"
        value={filters.segment}
        onChange={(v) => set({ segment: v })}
        options={[
          { value: "", label: "Todos" },
          { value: "ESTRATEGICO", label: <><SegmentGlyph segment="ESTRATEGICO" /> Estratégico</> },
          { value: "LOCAL", label: <><SegmentGlyph segment="LOCAL" /> Local</> },
        ]}
      />
      <SelectPill label="Municipio" value={filters.municipality} onChange={(v) => set({ municipality: v })} options={munOptions} all="Todos" />
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {typeof count === "number" ? (
          <p className="text-app-small text-ink-soft" aria-live="polite">
            <strong className="font-bold text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>{count}</strong> prov.
          </p>
        ) : null}
        {dirty ? (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={T.ui}
            onClick={reset}
            className="flex h-9 items-center gap-1.5 rounded-[var(--radius-pill)] bg-rose-100 px-3 text-app-small font-bold text-rose-700 hover:bg-rose-300"
          >
            <span aria-hidden="true">✕</span> Limpiar
          </motion.button>
        ) : null}
      </div>
    </motion.div>
  );
}
