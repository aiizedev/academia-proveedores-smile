import type { ReactNode } from "react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Stage } from "@/mocks/smile";

/* Piezas del back-office de la demo (datos simulados). Solo tokens: sin hex ni duraciones. */

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <p className="a-eyebrow">{eyebrow}</p>
        <h1 className="a-title">{title}</h1>
      </div>
      {children}
    </header>
  );
}

export function DemoNote() {
  return <p className="mt-8 text-app-caption text-ink-soft">Demo con datos simulados, coherentes con el seed. No consulta la API.</p>;
}

export function Kpi({ label, value, hint, strong = false }: { label: string; value: ReactNode; hint?: ReactNode; strong?: boolean }) {
  return (
    <Card strong={strong} className="flex flex-col gap-1">
      <span className={cn("text-app-caption font-bold uppercase tracking-[var(--tracking-caps)]", strong ? "text-olive-100" : "text-ink-soft")}>{label}</span>
      <span className="font-display text-[2.2rem] leading-none tabular-nums">{value}</span>
      {hint ? <span className={cn("text-app-small", strong ? "text-olive-100" : "text-ink-soft")}>{hint}</span> : null}
    </Card>
  );
}

/** Barra horizontal: `value` sobre `max`, con marcas opcionales (meta, base). */
export function Bar({
  label,
  value,
  max = 100,
  display,
  tone = "olive",
  marks = [],
}: {
  label: ReactNode;
  value: number;
  max?: number;
  display?: ReactNode;
  tone?: "olive" | "rose" | "warn";
  marks?: ReadonlyArray<{ at: number; label: string }>;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const fill = { olive: "bg-olive-600", rose: "bg-rose-500", warn: "bg-lvl-inicial-bar" }[tone];
  return (
    <div className="grid grid-cols-[11rem_1fr_4.5rem] items-center gap-3">
      <span className="truncate text-app-small font-semibold">{label}</span>
      <div className="relative h-4 rounded-pill bg-olive-100">
        <div className={cn("h-full rounded-pill transition-[width] duration-[var(--dur-l)] ease-out", fill)} style={{ width: `${pct}%` }} />
        {marks.map((m) => (
          <span
            key={m.label}
            title={m.label}
            className="absolute -top-1 h-6 w-[2px] bg-ink"
            style={{ left: `${Math.min(100, (m.at / max) * 100)}%` }}
          />
        ))}
      </div>
      <span className="text-right text-app-small font-bold tabular-nums">{display ?? value}</span>
    </div>
  );
}

const STAGE_STYLE: Record<Stage, string> = {
  E1: "bg-cream-200 text-ink",
  E2: "bg-olive-50 text-olive-900",
  E3: "bg-olive-100 text-olive-900",
  E4: "bg-rose-100 text-olive-900",
  E5: "bg-lvl-avanzado-bg text-lvl-avanzado-fg",
  E6: "bg-olive-800 text-cream",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return <span className={cn("inline-flex rounded-pill px-3 py-1 text-app-caption font-extrabold", STAGE_STYLE[stage])}>{stage}</span>;
}

export function SegmentBadge({ segment }: { segment: "ESTRATEGICO" | "LOCAL" }) {
  return (
    <span className={cn("inline-flex rounded-pill px-3 py-1 text-app-caption font-bold", segment === "ESTRATEGICO" ? "bg-rose-500 text-olive-900" : "bg-cream-200 text-ink-soft")}>
      {segment === "ESTRATEGICO" ? "Estratégico" : "Local"}
    </span>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 font-display text-[1.35rem]">{children}</h2>;
}
