import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.2 / §8.6 — casilla de autorización, opción única e ítem de
   checklist. Input nativo dentro de su label: toda la fila (≥ 59 px) es el
   objetivo táctil y el foco se ve en la fila. Al marcar, la casilla late
   (scale .7 → 1, elástica) y la palomita se dibuja (stroke-dashoffset). */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  children: ReactNode;
  /** Tacha el texto al marcar (checklist de la guía). */
  strike?: boolean;
}

export function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" width="1.2rem" height="1.2rem" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="draw-check">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function CheckRow({ type, children, className, strike, ...rest }: CheckboxProps & { type: "checkbox" | "radio" }) {
  return (
    <label
      className={cn(
        "group flex min-h-[3.7rem] cursor-pointer items-center gap-[0.85rem] rounded-m border-[1.5px] border-line bg-white px-4 py-3",
        "text-app-body font-bold leading-[1.35] transition-[background-color,border-color,scale] duration-[var(--dur-s)] active:scale-[var(--press-scale-card)]",
        "hover:border-olive-300 has-[:checked]:border-olive-300 has-[:checked]:bg-olive-25 has-[:disabled]:cursor-default has-[:disabled]:opacity-70",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-focus",
        className,
      )}
    >
      <input type={type} className="peer sr-only" {...rest} />
      <span
        aria-hidden
        className={cn(
          "grid size-[1.8rem] shrink-0 place-items-center rounded-check border-[1.8px] border-olive-300 text-cream",
          "transition-[background-color,border-color,scale] duration-[var(--dur-m)] ease-[var(--ease-back)]",
          "peer-checked:scale-100 peer-checked:border-olive-800 peer-checked:bg-olive-800 group-active:scale-[0.85]",
        )}
      >
        <CheckMark />
      </span>
      <span className={cn("transition-colors duration-[var(--dur-s)]", strike && "peer-checked:text-ink-soft peer-checked:line-through peer-checked:decoration-olive-300")}>{children}</span>
    </label>
  );
}

export function Checkbox(props: CheckboxProps) {
  return <CheckRow type="checkbox" {...props} />;
}

/** Opción única: agrupar varias con el mismo `name` dentro de un <fieldset>. */
export function Choice(props: CheckboxProps) {
  return <CheckRow type="radio" {...props} />;
}
