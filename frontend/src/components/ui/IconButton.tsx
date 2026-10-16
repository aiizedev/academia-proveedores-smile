import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.1 / §11 — botón de ícono. 3rem = 48 px: corrige los 46 px
   de la maqueta (RNF-USA-001). Requiere `label` accesible. */
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  onDark?: boolean;
}

export function IconButton({ label, children, onDark = false, className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "grid place-items-center size-12 shrink-0 rounded-full border",
        "transition-[scale] duration-[var(--dur-press)] ease-out active:scale-[var(--press-scale-icon)]",
        onDark
          ? "bg-[var(--on-strong-tint-bg)] border-[var(--on-strong-tint-line)] text-cream"
          : "bg-white border-line text-ink",
        className,
      )}
      {...rest}
    >
      <span className="inline-flex size-5">{children}</span>
    </button>
  );
}
