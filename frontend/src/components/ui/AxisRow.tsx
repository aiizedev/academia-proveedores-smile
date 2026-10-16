"use client";

import { motion } from "framer-motion";
import { Icon, type IconName } from "@/components/icons";
import { CountUp, GrowBar } from "@/components/motion";
import { T } from "@/design/motion-react";
import { cn } from "@/lib/cn";
import type { Level } from "./LevelBadge";

/* GUIA_VISUAL §8.5 — fila de eje: ícono · nombre + barra 7 px · porcentaje y
   nivel. La barra crece desde la izquierda (1.6 s, escalonada por `index`).
   El nivel va en texto además del color (RNF-ACC-001). */
const BAR: Record<Level, string> = { inicial: "bg-lvl-inicial-bar", desarrollo: "bg-lvl-desarrollo-bar", avanzado: "bg-lvl-avanzado-bar" };
const LABEL: Record<Level, string> = { inicial: "Inicial", desarrollo: "En desarrollo", avanzado: "Avanzado" };

export function AxisRow({ icon, name, score, level, index = 0 }: { icon: IconName; name: string; score: number; level: Level; index?: number }) {
  return (
    <motion.li
      className="grid grid-cols-[auto_1fr_auto] items-center gap-[0.9rem] rounded-button border border-line bg-white p-[0.9rem]"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ ...T.enter, delay: index * 0.08 }}
    >
      <span className="grid size-[2.8rem] shrink-0 place-items-center rounded-full bg-rose-100 text-olive-800">
        <Icon name={icon} size="1.4rem" />
      </span>
      <div className="min-w-0">
        <p className="text-[0.92rem] leading-[1.2] font-extrabold">{name}</p>
        <div className="relative mt-2 h-[7px] overflow-hidden rounded-pill bg-olive-100">
          <GrowBar className="absolute inset-y-0 left-0 block" trackStyle={{ width: `${score}%` }} fillClassName={cn("h-full rounded-pill", BAR[level])} delay={0.3 + index * 0.08} />
        </div>
        <p className="mt-1 text-[0.7rem] font-bold text-ink-soft">{LABEL[level]}</p>
      </div>
      <span className="font-display text-[1.45rem] tracking-[-0.03em]">
        <CountUp value={Math.round(score)} />
        <small className="font-body text-[0.7rem] text-ink-soft"> %</small>
      </span>
    </motion.li>
  );
}
