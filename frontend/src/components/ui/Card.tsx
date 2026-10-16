import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §5.3 / §5.4 — superficie plana: profundidad por color y borde, no
   sombra. `strong` invierte en oliva con grano; `lift` se eleva al pasar el puntero. */
export function Card({ strong = false, lift = false, className, ...rest }: HTMLAttributes<HTMLDivElement> & { strong?: boolean; lift?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-card p-[1.1rem]",
        strong ? "grain overflow-hidden bg-olive-800 text-cream" : "border border-line bg-white",
        lift && "lift",
        className,
      )}
      {...rest}
    />
  );
}
