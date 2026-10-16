import type { ReactNode } from "react";
import { Icon } from "@/components/icons";

/* GUIA_VISUAL §8.5 — alerta crítica: rosa, ícono alert y título en negrita. */
export function CriticalAlert({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div role="alert" className="flex gap-3 rounded-button border border-rose-300 bg-rose-100 p-4">
      <span className="text-rose-600">
        <Icon name="alert" size="1.5rem" />
      </span>
      <div className="flex flex-col gap-1 text-app-body">
        <p className="font-extrabold text-ink">{title}</p>
        <p>{children}</p>
        {action}
      </div>
    </div>
  );
}
