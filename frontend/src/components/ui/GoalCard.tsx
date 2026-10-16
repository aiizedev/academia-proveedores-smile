"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Icon, type IconName } from "@/components/icons";
import { GrowBar } from "@/components/motion";
import { PRESS, SPRING } from "@/design/motion-react";
import { cn } from "@/lib/cn";
import { Chip, type Priority } from "./Chip";

/* GUIA_VISUAL §8.6 — tarjeta de meta (.g-card): chips de prioridad y minutos,
   título Fraunces, ícono a la derecha y barra de 6 px que se llena al entrar.
   La primera (`top`) va invertida en oliva con acentos rosa y grano. */
const MotionLink = motion.create(Link);

export function GoalCard({
  href,
  priority,
  minutes,
  title,
  axisName,
  done,
  total,
  icon = "book",
  top = false,
  index = 0,
}: {
  href: string;
  priority: Priority;
  minutes: number;
  title: string;
  axisName: string;
  done: number;
  total: number;
  icon?: IconName;
  top?: boolean;
  index?: number;
}) {
  const percent = total ? Math.round((done / total) * 100) : 0;
  const complete = done === total && total > 0;
  return (
    <MotionLink
      href={href}
      whileTap={{ scale: PRESS.card }}
      whileHover={{ y: -3 }}
      transition={SPRING}
      className={cn(
        "relative grid grid-cols-[1fr_auto] gap-[0.9rem] overflow-hidden rounded-card border p-[1.1rem] transition-shadow duration-[var(--dur-m)] hover:shadow-lift",
        top ? "grain border-transparent bg-olive-800 text-cream" : "border-line bg-white text-ink",
      )}
    >
      <div className="relative z-[2] flex flex-wrap items-center gap-[0.4rem]">
        <Chip priority={complete ? "completa" : priority} onDark={top && !complete} />
        <span className={cn("inline-flex items-center gap-1 rounded-pill px-[0.6rem] py-[0.28rem] text-app-chip font-extrabold uppercase tracking-[var(--tracking-chip)]", top ? "bg-[var(--on-strong-tint-bg)] text-cream" : "bg-cream-200 text-ink-soft")}>
          <Icon name="clock" size="0.85rem" /> {minutes} min
        </span>
      </div>
      <span className={cn("relative z-[2] row-span-2 grid size-[3.2rem] place-items-center self-start rounded-full", top ? "bg-rose-500 text-olive-900" : "bg-rose-100 text-olive-800")}>
        <Icon name={icon} size="1.6rem" />
      </span>
      <div className="relative z-[2] flex flex-col gap-1">
        <span className={cn("text-app-chip font-extrabold uppercase tracking-[var(--tracking-caps)]", top ? "text-rose-300" : "text-olive-600")}>{axisName}</span>
        <span className="font-display text-[1.3rem] leading-[1.08] font-[420] tracking-[-0.02em]">{title}</span>
      </div>
      <div className={cn("relative z-[2] col-span-2 flex items-center gap-[0.7rem] text-[0.75rem] font-bold", top ? "text-olive-300" : "text-ink-soft")}>
        <div className={cn("h-1.5 flex-1 overflow-hidden rounded-pill", top ? "bg-[var(--on-strong-tint-bg)]" : "bg-olive-100")}>
          <GrowBar className="block h-full" trackStyle={{ width: `${percent}%` }} fillClassName={cn("h-full rounded-pill", top ? "bg-rose-500" : "bg-olive-600")} delay={0.25 + index * 0.08} />
        </div>
        <span className="tabular-nums">
          {done} de {total}
        </span>
      </div>
    </MotionLink>
  );
}
