import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.1 — botón primario de la app.
   Alto mínimo 3.7rem (≥ 48 px, RNF-USA-001); al presionar usa `scale`
   (no `transform`) para no interferir con GSAP (§10.1). */
export type ButtonVariant = "primary" | "rose" | "ghost" | "light";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-olive-800 text-cream",
  rose: "bg-rose-500 text-olive-900",
  ghost: "bg-transparent text-ink border-[1.5px] border-line",
  light: "bg-cream text-olive-900",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  block?: boolean;
}

export function Button({ variant = "primary", icon, block = true, className, children, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "relative inline-flex items-center justify-center gap-3 overflow-hidden",
        "min-h-[3.7rem] px-[1.4rem] rounded-button text-app-button font-extrabold",
        "transition-[scale,background-color] duration-[var(--dur-press)] ease-out",
        "active:scale-[var(--press-scale)] disabled:opacity-45 disabled:pointer-events-none",
        "[-webkit-tap-highlight-color:transparent]",
        block && "w-full",
        VARIANT[variant],
        className,
      )}
      {...rest}
    >
      {children}
      {icon ? <span className="inline-flex size-[1.3rem]">{icon}</span> : null}
    </button>
  );
}
