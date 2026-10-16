"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.5 y §3.4 — insignia de nivel de madurez. El nivel siempre
   lleva texto: el color nunca es la única señal (RNF-ACC-001). Con `pop` entra
   con impulso (scale .3, back.out) después del anillo (§9.4). */
export type Level = "inicial" | "desarrollo" | "avanzado";

const LABEL: Record<Level, string> = { inicial: "Inicial", desarrollo: "En desarrollo", avanzado: "Avanzado" };
const STYLE: Record<Level, string> = {
  inicial: "bg-lvl-inicial-bg text-lvl-inicial-fg",
  desarrollo: "bg-lvl-desarrollo-bg text-lvl-desarrollo-fg",
  avanzado: "bg-lvl-avanzado-bg text-lvl-avanzado-fg",
};

export function LevelBadge({ level, className, pop, delay = 1.1 }: { level: Level; className?: string; pop?: boolean; delay?: number }) {
  return (
    <motion.span
      initial={pop ? { scale: 0.3, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.34, 1.9, 0.64, 1], delay: pop ? delay : 0 }}
      className={cn(
        "inline-flex items-center gap-[0.45rem] rounded-pill px-4 py-[0.55rem]",
        "text-[0.8rem] font-extrabold uppercase tracking-[var(--tracking-chip)]",
        "before:size-2 before:rounded-full before:bg-current before:content-['']",
        STYLE[level],
        className,
      )}
    >
      {LABEL[level]}
    </motion.span>
  );
}
