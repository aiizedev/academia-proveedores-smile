import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §5.3 / §5.4 — superficie plana: profundidad por color y borde, no sombra. */
export function Card({ strong = false, className, ...rest }: HTMLAttributes<HTMLDivElement> & { strong?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-card p-[1.1rem]",
        strong ? "bg-olive-800 text-cream" : "bg-white border border-line",
        className,
      )}
      {...rest}
    />
  );
}
