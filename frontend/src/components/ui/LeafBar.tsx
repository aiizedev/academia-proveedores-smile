"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef } from "react";
import { T } from "@/design/motion-react";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.4 / §9.4 — barra de progreso de la autoevaluación: pista de
   12 px, relleno en degradado y una hoja de 26 px que viaja con el borde
   (0.9 s expo.out) y rebota al llegar (rotación −25° → 0, elástica). */
export function LeafBar({ value, total, className }: { value: number; total: number; className?: string }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  const leaf = useAnimationControls();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    void leaf.start({ rotate: [-25, 0], transition: { type: "spring", stiffness: 260, damping: 7, mass: 0.6 } });
  }, [percent, leaf]);

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div
        role="progressbar"
        aria-label="Avance de la autoevaluación"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="relative h-3 flex-1 rounded-pill bg-olive-100"
      >
        <motion.div className="absolute inset-y-0 left-0 rounded-pill bg-[image:var(--grad-progress)]" initial={false} animate={{ width: `${percent}%` }} transition={T.reveal} />
        <motion.span aria-hidden className="absolute top-1/2 -mt-[13px] -ml-[13px] size-[26px] text-olive-800" initial={false} animate={{ left: `${percent}%` }} transition={T.reveal}>
          <motion.svg viewBox="0 0 24 24" className="size-full drop-shadow-sm" animate={leaf}>
            <circle cx="12" cy="12" r="11" style={{ fill: "var(--cream)" }} />
            <path d="M6 18c0-7 4.5-11.5 12-12 0 7.5-4.5 12-12 12Z" fill="currentColor" />
            <path d="M6.5 17.5 13 11" strokeWidth="1.4" strokeLinecap="round" style={{ stroke: "var(--cream)" }} />
          </motion.svg>
        </motion.span>
      </div>
      <span className="text-[0.85rem] font-bold text-ink-soft tabular-nums">
        <b className="text-ink">{value}</b> de {total}
      </span>
    </div>
  );
}
