import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.4 — barra de progreso de la autoevaluación con contador.
   POC: sin la hoja SVG que viaja con el borde (llega con el pulido de movimiento). */
export function LeafBar({ value, total, className }: { value: number; total: number; className?: string }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        role="progressbar"
        aria-label="Avance de la autoevaluación"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-3 flex-1 overflow-hidden rounded-pill bg-olive-100"
      >
        <div
          className="h-full rounded-pill bg-[image:var(--grad-progress)] transition-[width] duration-[var(--dur-l)] ease-expo-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-app-small font-bold tabular-nums">
        {value} de {total}
      </span>
    </div>
  );
}
