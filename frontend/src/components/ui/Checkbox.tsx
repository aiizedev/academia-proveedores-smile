import type { InputHTMLAttributes, ReactNode } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.2 — casilla de autorización y opción única. Input nativo
   dentro de su label: toda la fila (≥ 59 px) es el objetivo táctil y el foco
   se ve en la fila. */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  children: ReactNode;
}

function CheckRow({ type, children, className, ...rest }: CheckboxProps & { type: "checkbox" | "radio" }) {
  return (
    <label
      className={cn(
        "group flex min-h-[3.7rem] cursor-pointer items-center gap-3 rounded-m border-[1.5px] border-line bg-white px-4 py-3",
        "text-app-body font-bold transition-[background-color,border-color] duration-[var(--dur-s)]",
        "has-[:checked]:border-olive-600 has-[:checked]:bg-olive-25",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-focus",
        className,
      )}
    >
      <input type={type} className="peer sr-only" {...rest} />
      <span
        aria-hidden
        className={cn(
          "grid size-[1.8rem] shrink-0 place-items-center rounded-check border-[1.5px] border-olive-300 text-transparent",
          "peer-checked:border-olive-800 peer-checked:bg-olive-800 peer-checked:text-cream",
        )}
      >
        <Icon name="check" size="1.1rem" />
      </span>
      <span>{children}</span>
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
