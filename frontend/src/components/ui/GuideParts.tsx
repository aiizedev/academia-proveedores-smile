import type { InputHTMLAttributes, ReactNode } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.6 — piezas de la guía: cabecera, pasos, checklist y consejo. */

export function GuideHero({ eyebrow, title, minutes }: { eyebrow: string; title: string; minutes: number }) {
  return (
    <header className="grain -mx-[var(--screen-x)] flex flex-col gap-2 rounded-b-sheet bg-olive-800 px-[var(--screen-x)] pt-4 pb-7 text-cream">
      <p className="text-app-eyebrow font-black uppercase tracking-[var(--tracking-caps)] text-rose-500">{eyebrow}</p>
      <h1 className="font-display text-app-title leading-[var(--lh-heading)]">{title}</h1>
      <p className="text-app-small text-olive-300">{minutes} minutos de lectura</p>
    </header>
  );
}

export function Steps({ steps }: { steps: ReadonlyArray<{ title: string; detail: string }> }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex gap-4 pb-5 last:pb-0">
          {i < steps.length - 1 ? <span aria-hidden className="absolute top-10 bottom-0 left-[1.2rem] w-[1.5px] bg-olive-100" /> : null}
          <span aria-hidden className="grid size-[2.4rem] shrink-0 place-items-center rounded-full bg-rose-100 font-display text-app-h3 italic text-rose-700">
            {i + 1}
          </span>
          <div className="flex flex-col gap-1 pt-1">
            <p className="font-bold">{step.title}</p>
            <p className="text-app-body text-ink-soft">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Ítem de checklist: casilla 1.8rem; marcado en oliva, fila clara y texto tachado. */
export function ChecklistItem({ children, className, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { children: ReactNode }) {
  return (
    <label
      className={cn(
        "flex min-h-[3.7rem] cursor-pointer items-center gap-3 rounded-m border-[1.5px] border-line bg-white px-4 py-3 text-app-body font-bold",
        "transition-[background-color] duration-[var(--dur-s)] has-[:checked]:bg-olive-25",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-focus",
        className,
      )}
    >
      <input type="checkbox" className="peer sr-only" {...rest} />
      <span
        aria-hidden
        className="grid size-[1.8rem] shrink-0 place-items-center rounded-check border-[1.5px] border-olive-300 text-transparent peer-checked:border-olive-800 peer-checked:bg-olive-800 peer-checked:text-cream"
      >
        <Icon name="check" size="1.1rem" />
      </span>
      <span className="peer-checked:text-ink-soft peer-checked:line-through">{children}</span>
    </label>
  );
}

export function Tip({ children }: { children: ReactNode }) {
  return (
    <aside className="flex gap-3 rounded-button bg-rose-100 p-4 text-app-body">
      <span className="text-rose-600">
        <Icon name="bpa" size="1.4rem" />
      </span>
      <p>{children}</p>
    </aside>
  );
}
