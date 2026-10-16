import type { ButtonHTMLAttributes } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.4 — respuesta de la autoevaluación: botón de 74 px, texto
   grande; seleccionada en oliva con check. aria-pressed anuncia la elección. */
export interface AnswerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
}

export function Answer({ selected, className, children, type = "button", ...rest }: AnswerProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "flex min-h-[4.6rem] w-full items-center justify-between gap-3 rounded-card border-[1.5px] px-5 text-left",
        "text-app-answer font-extrabold transition-[background-color,border-color,color,scale] duration-[var(--dur-s)]",
        "active:scale-[var(--press-scale-card)] [-webkit-tap-highlight-color:transparent]",
        selected ? "border-olive-800 bg-olive-800 text-cream" : "border-line bg-white text-ink",
        className,
      )}
      {...rest}
    >
      <span>{children}</span>
      {selected ? <Icon name="check" size="1.4rem" /> : null}
    </button>
  );
}
