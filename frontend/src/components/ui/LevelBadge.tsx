import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.5 y §3.4 — insignia de nivel de madurez. El nivel siempre
   lleva texto: el color nunca es la única señal (RNF-ACC-001). */
export type Level = "inicial" | "desarrollo" | "avanzado";

const LABEL: Record<Level, string> = { inicial: "Inicial", desarrollo: "En desarrollo", avanzado: "Avanzado" };
const STYLE: Record<Level, string> = {
  inicial: "bg-lvl-inicial-bg text-lvl-inicial-fg",
  desarrollo: "bg-lvl-desarrollo-bg text-lvl-desarrollo-fg",
  avanzado: "bg-lvl-avanzado-bg text-lvl-avanzado-fg",
};

export function LevelBadge({ level, className }: { level: Level; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[0.45rem] rounded-pill px-4 py-[0.55rem]",
        "text-[0.8rem] font-extrabold uppercase tracking-[var(--tracking-chip)]",
        "before:size-2 before:rounded-full before:bg-current before:content-['']",
        STYLE[level],
        className,
      )}
    >
      {LABEL[level]}
    </span>
  );
}
