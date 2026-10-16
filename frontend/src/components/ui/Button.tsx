import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.1 — botón primario de la app.
   Alto mínimo 3.7rem (≥ 48 px, RNF-USA-001); al presionar usa `scale`
   (no `transform`) para no interferir con las animaciones (§10.1). El ícono
   avanza 4 px al pasar el puntero, como en la maqueta. */
export type ButtonVariant = "primary" | "rose" | "ghost" | "light";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-olive-800 text-cream hover:bg-olive-900",
  rose: "bg-rose-500 text-olive-900 hover:bg-rose-300",
  ghost: "bg-transparent text-ink border-[1.5px] border-line hover:bg-white hover:border-olive-300",
  light: "bg-cream text-olive-900 hover:bg-white",
};

const BASE = cn(
  "group relative inline-flex items-center justify-center gap-3 overflow-hidden",
  "min-h-[3.7rem] px-[1.4rem] rounded-button text-app-button font-extrabold",
  "transition-[scale,background-color,border-color] duration-[var(--dur-press)] ease-out",
  "active:scale-[var(--press-scale)] disabled:opacity-45 disabled:pointer-events-none",
  "[-webkit-tap-highlight-color:transparent]",
);

const IconSlot = ({ icon }: { icon: ReactNode }) => (
  <span className="inline-flex size-[1.3rem] transition-[translate] duration-[var(--dur-m)] ease-out group-hover:translate-x-1">{icon}</span>
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  block?: boolean;
}

export function Button({ variant = "primary", icon, block = true, className, children, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={cn(BASE, block && "w-full", VARIANT[variant], className)} {...rest}>
      {children}
      {icon ? <IconSlot icon={icon} /> : null}
    </button>
  );
}

/** Enlace con la anatomía del botón (navegación primaria entre pantallas). */
export function ButtonLink({
  href,
  variant = "primary",
  icon,
  block = true,
  className,
  children,
  external,
}: {
  href: string;
  variant?: ButtonVariant;
  icon?: ReactNode;
  block?: boolean;
  className?: string;
  children: ReactNode;
  external?: boolean;
}) {
  const classes = cn(BASE, block && "w-full", VARIANT[variant], className);
  const body = (
    <>
      {children}
      {icon ? <IconSlot icon={icon} /> : null}
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {body}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {body}
    </Link>
  );
}
