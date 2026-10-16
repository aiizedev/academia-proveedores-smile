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
  urgente: "bg-prio-urgente-bg text-prio-urgente-fg",
  alta: "bg-prio-alta-bg text-prio-alta-fg",
  media: "bg-prio-media-bg text-prio-media-fg",
  mantener: "bg-prio-mantener-bg text-prio-mantener-fg",
  completa: "bg-prio-done-bg text-prio-done-fg",
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
