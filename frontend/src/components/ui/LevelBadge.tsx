import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.5 y §3.4 — insignia de nivel de madurez. El nivel siempre
   lleva texto: el color nunca es la única señal (RNF-ACC-001). */
export type Level = "inicial" | "desarrollo" | "avanzado";

const LABEL: Record<Level, string> = { inicial: "Inicial", desarrollo: "En desarrollo", avanzado: "Avanzado" };
const STYLE: Record<Level, string> = {
  inicial: "bg-[var(--lvl-inicial-bg)] text-[var(--lvl-inicial-fg)]",
  desarrollo: "bg-[var(--lvl-desarrollo-bg)] text-[var(--lvl-desarrollo-fg)]",
  avanzado: "bg-[var(--lvl-avanzado-bg)] text-[var(--lvl-avanzado-fg)]",
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
