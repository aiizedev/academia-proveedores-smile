"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { MaskWords, Pressable } from "@/components/motion";
import { T } from "@/design/motion-react";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";

/* Piezas compartidas de las pantallas de demo (POC). */
export const day = (iso: string) => formatDate(`${iso}T12:00:00-05:00`);

/** Encabezado de pantalla: eyebrow, titular por palabras con la palabra clave en cursiva rosa y entrada. */
export function ScreenTitle({ eyebrow, title, emphasis, intro, aside }: { eyebrow: string; title: string; emphasis?: string[]; intro?: string; aside?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <motion.p className="a-eyebrow" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={T.enter}>
          {eyebrow}
        </motion.p>
        {aside}
      </div>
      <MaskWords as="h1" text={title} emphasis={emphasis} className="a-title" delay={0.05} />
      {intro ? (
        <motion.p className="text-app-body leading-[1.5] text-ink-soft" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...T.enter, delay: 0.25 }}>
          {intro}
        </motion.p>
      ) : null}
    </div>
  );
}

export function DemoNote() {
  return (
    <p className="flex items-center gap-2 text-app-caption text-ink-soft">
      <Icon name="sparkle" size="0.9rem" /> Datos de demostración.
    </p>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex min-h-12 items-center gap-2 font-bold text-olive-800 underline decoration-olive-300 underline-offset-4 transition-colors duration-[var(--dur-s)] hover:decoration-olive-800">
      {children}
      <span className="transition-[translate] duration-[var(--dur-m)] group-hover:translate-x-1">
        <Icon name="arrow" size="1rem" />
      </span>
    </Link>
  );
}

/** Acceso de navegación en tarjeta: ícono en círculo, título Fraunces y flecha. */
export function NavCard({ href, icon, title, detail, strong = false, badge }: { href: string; icon: IconName; title: string; detail?: string; strong?: boolean; badge?: string }) {
  return (
    <Pressable className="h-full">
      <Link
        href={href}
        className={cn(
          "relative flex h-full flex-col justify-between gap-5 overflow-hidden rounded-card border p-4 transition-shadow duration-[var(--dur-m)] hover:shadow-lift",
          strong ? "grain border-transparent bg-olive-800 text-cream" : "border-line bg-white",
        )}
      >
        <div className="relative z-[2] flex items-start justify-between gap-2">
          <span className={cn("grid size-[2.9rem] place-items-center rounded-full", strong ? "bg-rose-500 text-olive-900" : "bg-rose-100 text-olive-800")}>
            <Icon name={icon} size="1.45rem" />
          </span>
          {badge ? (
            <span className={cn("rounded-pill px-2 py-1 text-app-chip font-extrabold uppercase tracking-[var(--tracking-chip)]", strong ? "bg-rose-500 text-olive-900" : "bg-cream-200 text-ink-soft")}>{badge}</span>
          ) : null}
        </div>
        <div className="relative z-[2]">
          <span className="block font-display text-[1.3rem] leading-none tracking-[-0.02em]">{title}</span>
          {detail ? <span className={cn("mt-1 block text-app-caption", strong ? "text-olive-300" : "text-ink-soft")}>{detail}</span> : null}
        </div>
      </Link>
    </Pressable>
  );
}

/** Fila de lista con entrada escalonada. */
export function ListRow({ title, detail, value, icon, index = 0 }: { title: string; detail: string; value: string; icon?: IconName; index?: number }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { ...T.enter, delay: Math.min(index, 6) * 0.05 } }}
      exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}
      className="flex items-center gap-3 rounded-button border border-line bg-white p-3"
    >
      {icon ? (
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-100 text-olive-800">
          <Icon name={icon} size="1.2rem" />
        </span>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold">{title}</span>
        <span className="truncate text-app-caption text-ink-soft">{detail}</span>
      </div>
      <span className="shrink-0 font-display text-[1.15rem] tracking-[-0.02em] tabular-nums">{value}</span>
    </motion.li>
  );
}

/** Indicador compacto con grano cuando es fuerte. */
export function Stat({ label, value, hint, strong = false, icon }: { label: string; value: ReactNode; hint?: string; strong?: boolean; icon?: IconName }) {
  return (
    <div className={cn("relative flex flex-col gap-2 overflow-hidden rounded-card p-4", strong ? "grain bg-olive-800 text-cream" : "border border-line bg-white")}>
      <div className="relative z-[2] flex items-center justify-between gap-2">
        <span className={cn("text-app-caption font-semibold", strong ? "text-olive-300" : "text-ink-soft")}>{label}</span>
        {icon ? (
          <span className={cn("grid size-7 place-items-center rounded-full", strong ? "bg-rose-500 text-olive-900" : "bg-rose-100 text-olive-800")}>
            <Icon name={icon} size="0.95rem" />
          </span>
        ) : null}
      </div>
      <span className="relative z-[2] font-display text-[1.55rem] leading-none tracking-[-0.03em] tabular-nums">{value}</span>
      {hint ? <span className={cn("relative z-[2] text-app-caption", strong ? "text-olive-300" : "text-ink-soft")}>{hint}</span> : null}
    </div>
  );
}

/** Subtítulo de sección dentro de una pantalla. */
export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-[0.72rem] font-extrabold uppercase tracking-[var(--tracking-caps)] text-olive-600">{children}</h2>
      {action}
    </div>
  );
}
