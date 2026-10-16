import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.6 y §3.4 — chips de prioridad de meta. */
export type Priority = "urgente" | "alta" | "media" | "mantener" | "completa";

const LABEL: Record<Priority, string> = {
  urgente: "Urgente",
  alta: "Prioridad alta",
  media: "Prioridad media",
  mantener: "Mantener",
  completa: "Completa",
};

const STYLE: Record<Priority, string> = {
  urgente: "bg-[var(--prio-urgente-bg)] text-[var(--prio-urgente-fg)]",
  alta: "bg-[var(--prio-alta-bg)] text-[var(--prio-alta-fg)]",
  media: "bg-[var(--prio-media-bg)] text-[var(--prio-media-fg)]",
  mantener: "bg-[var(--prio-mantener-bg)] text-[var(--prio-mantener-fg)]",
  completa: "bg-[var(--prio-done-bg)] text-[var(--prio-done-fg)]",
};

export function Chip({ priority, children, className }: { priority: Priority; children?: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-[0.6rem] py-[0.28rem]",
        "text-app-chip font-extrabold uppercase tracking-[var(--tracking-chip)]",
        STYLE[priority],
        className,
      )}
    >
      {children ?? LABEL[priority]}
    </span>
  );
}
