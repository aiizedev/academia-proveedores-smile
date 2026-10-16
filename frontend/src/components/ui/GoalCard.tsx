import Link from "next/link";
import { cn } from "@/lib/cn";
import { Chip, type Priority } from "./Chip";

/* GUIA_VISUAL §8.6 — tarjeta de meta: chips de prioridad y minutos, título
   Fraunces, barra de 6 px. La primera (`top`) va invertida en oliva. */
export function GoalCard({
  href,
  priority,
  minutes,
  title,
  axisName,
  done,
  total,
  top = false,
}: {
  href: string;
  priority: Priority;
  minutes: number;
  title: string;
  axisName: string;
  done: number;
  total: number;
  top?: boolean;
}) {
  const percent = total ? Math.round((done / total) * 100) : 0;
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col gap-3 rounded-card border-[1.5px] p-[1.1rem] transition-[scale] duration-[var(--dur-press)] active:scale-[var(--press-scale-card)]",
        top ? "border-olive-800 bg-olive-800 text-cream" : "border-line bg-white text-ink",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Chip priority={done === total && total > 0 ? "completa" : priority} />
        <span className={cn("text-app-chip font-bold", top ? "text-olive-300" : "text-ink-soft")}>{minutes} min</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className={cn("text-app-caption font-bold uppercase tracking-[var(--tracking-caps)]", top ? "text-rose-500" : "text-olive-600")}>{axisName}</span>
        <span className="font-display text-app-h3">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className={cn("h-1.5 flex-1 overflow-hidden rounded-pill", top ? "bg-[var(--on-strong-tint-bg)]" : "bg-olive-100")}>
          <div className={cn("h-full rounded-pill", top ? "bg-rose-500" : "bg-olive-600")} style={{ width: `${percent}%` }} />
        </div>
        <span className="text-app-caption font-bold tabular-nums">
          {done} de {total}
        </span>
      </div>
    </Link>
  );
}
