import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/lib/cn";
import { LevelBadge, type Level } from "./LevelBadge";

/* GUIA_VISUAL §8.5 — fila de eje: ícono · nombre + barra 7 px · porcentaje y nivel.
   El nivel va en texto además del color (RNF-ACC-001). */
const BAR: Record<Level, string> = { inicial: "bg-lvl-inicial-bar", desarrollo: "bg-lvl-desarrollo-bar", avanzado: "bg-lvl-avanzado-bar" };

export function AxisRow({ icon, name, score, level }: { icon: IconName; name: string; score: number; level: Level }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid size-[2.8rem] shrink-0 place-items-center rounded-full bg-rose-100 text-olive-800">
        <Icon name={icon} size="1.4rem" />
      </span>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-app-body font-bold">{name}</span>
          <span className="font-display text-app-h3 tabular-nums">{Math.round(score)} %</span>
        </div>
        <div className="h-[7px] overflow-hidden rounded-pill bg-olive-100">
          <div className={cn("h-full rounded-pill", BAR[level])} style={{ width: `${score}%` }} />
        </div>
        <LevelBadge level={level} className="self-start px-3 py-1" />
      </div>
    </li>
  );
}
