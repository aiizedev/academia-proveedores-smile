import type { ReactNode } from "react";
import { MaskWords, Skeleton } from "@/components/motion";
import { cn } from "@/lib/cn";
import { STAGES, type Segment, type Stage } from "@/mocks/smile";

/* Piezas del back-office (datos simulados). Solo tokens: sin hex ni duraciones. */

/** Cabecera de página: eyebrow + titular Fraunces que sube por palabras (palabra clave en cursiva rosa). */
export function PageHeader({
  eyebrow,
  title,
  emphasis,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  emphasis?: string[];
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="flex max-w-3xl flex-col gap-2.5">
        <p className="a-eyebrow flex items-center gap-2">
          <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-rose-500" />
          {eyebrow}
        </p>
        <MaskWords text={title} emphasis={emphasis} className="a-title text-[2.6rem]" />
        {lead ? <p className="max-w-2xl text-app-body text-ink-soft">{lead}</p> : null}
      </div>
      {children}
    </header>
  );
}

/** Superficie de contenido (misma anatomía que ChartCard, para lo que no es gráfica). */
export function Panel({ title, subtitle, actions, children, className }: { title?: string; subtitle?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("relative rounded-[var(--radius-card)] border border-line bg-white p-6", className)}>
      {title ? (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-[1.25rem] leading-tight tracking-[-0.02em]">{title}</h3>
            {subtitle ? <p className="mt-1 text-app-small text-ink-soft">{subtitle}</p> : null}
          </div>
          {actions}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function DemoNote() {
  return (
    <p className="mt-10 flex items-center gap-2 text-app-caption text-ink-soft">
      <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-olive-400" />
      Demo con datos simulados, coherentes con el seed (31 proveedores de la red piloto). Solo indicadores agregados: Smile no ve transacciones del Mini ERP.
    </p>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 font-display text-[1.35rem]">{children}</h2>;
}

const stageIndex = (s: Stage) => STAGES.findIndex((x) => x.code === s);
export const stageColor = (s: Stage) => `var(--chart-ord-${stageIndex(s) + 1})`;

/** Etapa: número + color de la rampa ordinal + camino de 6 pasos (nunca solo color). */
export function StageBadge({ stage, withName = false }: { stage: Stage; withName?: boolean }) {
  const i = stageIndex(stage);
  return (
    <span className="inline-flex items-center gap-2" title={STAGES[i]?.name}>
      <span className="inline-flex items-end gap-[2px]" aria-hidden="true">
        {STAGES.map((st, k) => (
          <span
            key={st.code}
            className="block w-[5px] rounded-[var(--radius-mark)]"
            style={{ height: 6 + k * 2, background: k <= i ? `var(--chart-ord-${k + 1})` : "var(--chart-track)" }}
          />
        ))}
      </span>
      <span className="text-app-caption font-extrabold" style={{ fontVariantNumeric: "tabular-nums" }}>
        {stage}
      </span>
      {withName ? <span className="text-app-caption text-ink-soft">{STAGES[i]?.name}</span> : null}
    </span>
  );
}

/** Segmento: forma (rombo estratégico, círculo local) + texto. */
export function SegmentBadge({ segment }: { segment: Segment }) {
  const strategic = segment === "ESTRATEGICO";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-app-caption font-bold", strategic ? "bg-rose-100 text-rose-700" : "bg-olive-25 text-olive-700")}>
      <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true">
        {strategic ? (
          <rect x="1.8" y="1.8" width="6.4" height="6.4" transform="rotate(45 5 5)" style={{ fill: "var(--chart-highlight)" }} />
        ) : (
          <circle cx="5" cy="5" r="4" style={{ fill: "var(--chart-local)" }} />
        )}
      </svg>
      {strategic ? "Estratégico" : "Local"}
    </span>
  );
}

/** Estado vacío con paisaje sutil (sol, cerros, brote) y texto en el tono Smile. */
export function EmptyState({ title, body, action, compact = false }: { title: string; body?: ReactNode; action?: ReactNode; compact?: boolean }) {
  return (
    <div className={cn("grid place-items-center text-center", compact ? "gap-2 py-6" : "gap-3 py-12")}>
      <svg width={compact ? 120 : 168} height={compact ? 64 : 90} viewBox="0 0 168 90" aria-hidden="true">
        <circle cx="122" cy="30" r="16" style={{ fill: "var(--rose-300)" }} />
        <path d="M0 74 C 30 52, 58 50, 86 64 S 140 70, 168 56 V90 H0 Z" style={{ fill: "var(--olive-100)" }} />
        <path d="M0 82 C 40 66, 84 70, 118 80 S 156 84, 168 78 V90 H0 Z" style={{ fill: "var(--olive-300)" }} />
        <path d="M70 80 V64" strokeWidth="1.6" strokeLinecap="round" style={{ stroke: "var(--olive-800)" }} />
        <path d="M70 66 c0-6 4-10 11-10 0 6-4 10-11 10Z" style={{ fill: "var(--olive-600)" }} />
        <path d="M70 70 c0-5-3.5-8-9-8 0 5 3.5 8 9 8Z" style={{ fill: "var(--rose-500)" }} />
      </svg>
      <p className="font-display text-[1.3rem] leading-tight tracking-[-0.02em]">{title}</p>
      {body ? <p className="max-w-sm text-app-small text-ink-soft">{body}</p> : null}
      {action}
    </div>
  );
}

/** Esqueleto de un tablero (mientras "llegan" los datos simulados). */
export function DashboardSkeleton({ tiles = 4, blocks = 2 }: { tiles?: number; blocks?: number }) {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Cargando tablero">
      {tiles > 0 ? (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {Array.from({ length: tiles }, (_, i) => (
            <Skeleton key={i} className="h-[9.5rem]" />
          ))}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {Array.from({ length: blocks }, (_, i) => (
          <Skeleton key={i} className="h-[26rem]" />
        ))}
      </div>
    </div>
  );
}
