"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { GrowBar, MaskWords } from "@/components/motion";
import { T } from "@/design/motion-react";
import { cn } from "@/lib/cn";
import { CheckMark } from "./Checkbox";

/* GUIA_VISUAL §8.6 — piezas de la guía: cabecera oscura (.g-hero) con grano e
   ícono gigante, pasos unidos por una línea que se dibuja, checklist con
   palomita dibujada y consejo. */

export function GuideHero({
  eyebrow,
  title,
  minutes,
  icon = "book",
  backHref,
  chips = [],
}: {
  eyebrow: string;
  title: string;
  minutes: number;
  icon?: IconName;
  backHref?: string;
  chips?: string[];
}) {
  return (
    <header className="grain relative -mx-[var(--screen-x)] -mt-[0.6rem] overflow-hidden rounded-b-sheet bg-olive-800 px-[var(--screen-x)] pt-3 pb-8 text-cream">
      <motion.span
        aria-hidden
        className="pointer-events-none absolute top-10 -right-6 size-36 text-olive-600 [&_svg]:[stroke-width:1]"
        initial={{ rotate: -30, scale: 0.6, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 0.9 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Icon name={icon} size="100%" />
      </motion.span>
      <div className="relative z-[2] flex items-center justify-between">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Volver"
            className="grid size-12 place-items-center rounded-full border border-[var(--on-strong-tint-line)] bg-[var(--on-strong-tint-bg)] text-cream transition-[scale] duration-[var(--dur-press)] active:scale-[var(--press-scale-icon)] focus-visible:outline-rose-500"
          >
            <Icon name="back" size="1.25rem" />
          </Link>
        ) : (
          <span />
        )}
        <p className="text-app-eyebrow font-black uppercase tracking-[var(--tracking-caps)] text-rose-500">{eyebrow}</p>
      </div>
      <MaskWords as="h1" text={title} delay={0.15} className="relative z-[2] mt-10 max-w-[12ch] font-display text-[2.2rem] leading-none font-[350] tracking-[-0.035em]" />
      <motion.div className="relative z-[2] mt-4 flex flex-wrap gap-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...T.enter, delay: 0.5 }}>
        <span className="inline-flex items-center gap-1 rounded-pill bg-[var(--on-strong-tint-bg)] px-[0.6rem] py-[0.28rem] text-app-chip font-extrabold uppercase tracking-[var(--tracking-chip)] text-cream">
          <Icon name="clock" size="0.85rem" /> {minutes} min de lectura
        </span>
        {chips.map((c) => (
          <span key={c} className="inline-flex items-center rounded-pill bg-[var(--on-strong-tint-bg)] px-[0.6rem] py-[0.28rem] text-app-chip font-extrabold uppercase tracking-[var(--tracking-chip)] text-cream">
            {c}
          </span>
        ))}
      </motion.div>
    </header>
  );
}

export function Steps({ steps }: { steps: ReadonlyArray<{ title: string; detail: string }> }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => (
        <motion.li
          key={step.title}
          className="relative grid grid-cols-[2.4rem_1fr] gap-[0.9rem] pb-[1.3rem] last:pb-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
          transition={{ ...T.enter, delay: i * 0.08 }}
        >
          {i < steps.length - 1 ? (
            <GrowBar axis="y" className="absolute top-[2.5rem] bottom-[0.2rem] left-[1.2rem] -ml-[0.75px] block w-[1.5px]" fillClassName="h-full w-full bg-olive-100" duration={0.9} ease={[0.65, 0, 0.35, 1]} delay={0.2 + i * 0.12} />
          ) : null}
          <span aria-hidden className="grid size-[2.4rem] place-items-center rounded-full bg-rose-100 font-display text-[1.1rem] italic text-rose-700">
            {i + 1}
          </span>
          <div className="flex flex-col gap-1 pt-[0.4rem]">
            <p className="font-extrabold">{step.title}</p>
            <p className="text-[0.92rem] leading-[1.5] text-ink-soft">{step.detail}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}

/** Ítem de checklist: casilla 1.8rem; marcado en oliva con palomita dibujada, fila clara y texto tachado. */
export function ChecklistItem({ children, className, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { children: ReactNode }) {
  return (
    <label
      className={cn(
        "group grid min-h-[3.7rem] cursor-pointer grid-cols-[auto_1fr] items-center gap-[0.85rem] rounded-m border-[1.5px] border-line bg-white p-[0.95rem] text-[0.93rem] leading-[1.35] font-semibold",
        "transition-[background-color,border-color,scale] duration-[var(--dur-s)] active:scale-[var(--press-scale-card)] hover:border-olive-300",
        "has-[:checked]:border-olive-300 has-[:checked]:bg-olive-25 has-[:disabled]:cursor-default",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-focus",
        className,
      )}
    >
      <input type="checkbox" className="peer sr-only" {...rest} />
      <span
        aria-hidden
        className="grid size-[1.8rem] shrink-0 place-items-center rounded-check border-[1.8px] border-olive-300 text-cream transition-[background-color,border-color,scale] duration-[var(--dur-m)] ease-[var(--ease-back)] group-active:scale-[0.8] peer-checked:border-olive-800 peer-checked:bg-olive-800"
      >
        <CheckMark />
      </span>
      <span className="transition-colors duration-[var(--dur-s)] peer-checked:text-ink-soft peer-checked:line-through peer-checked:decoration-olive-300">{children}</span>
    </label>
  );
}

export function Tip({ children }: { children: ReactNode }) {
  return (
    <aside className="flex gap-3 rounded-button bg-rose-100 p-4 text-[0.92rem] leading-[1.45]">
      <span className="text-rose-600">
        <Icon name="sparkle" size="1.4rem" />
      </span>
      <p>{children}</p>
    </aside>
  );
}
