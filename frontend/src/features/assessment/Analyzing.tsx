"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { EASING } from "@/design/motion-react";

/* GUIA_VISUAL §9.4 "Analizando" (≈ 2,6 s): pétalos que nacen desde la base
   (back.out, escalonados), la flor gira 360° y una línea por eje entra y
   sale; al final los pétalos suben y se van. Luego llama a `onDone`. */
const PETAL = "M0 -8 C 22 -30, 24 -64, 0 -88 C -24 -64, -22 -30, 0 -8 Z";
export const ANALYZING_MS = 2600;

export function Analyzing({ axes, onDone }: { axes: string[]; onDone: () => void }) {
  const reduced = useReducedMotion();
  const [line, setLine] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const total = reduced ? 700 : ANALYZING_MS;
    const step = setInterval(() => setLine((n) => Math.min(n + 1, axes.length - 1)), reduced ? 10_000 : 450);
    const out = setTimeout(() => setLeaving(true), total - 450);
    const done = setTimeout(onDone, total);
    return () => {
      clearInterval(step);
      clearTimeout(out);
      clearTimeout(done);
    };
  }, [axes.length, onDone, reduced]);

  return (
    <section aria-busy="true" aria-live="polite" className="flex min-h-[70dvh] flex-col items-center justify-center gap-6 text-center min-[900px]:min-h-[36rem]">
      <motion.svg aria-hidden viewBox="-100 -100 200 200" className="size-[120px]" animate={{ rotate: 360 }} transition={{ duration: 2.6, ease: EASING.move }}>
        {[0, 90, 180, 270].map((r, i) => (
          <g key={r} transform={`rotate(${r})`}>
            <motion.path
              d={PETAL}
              style={{ fill: "var(--rose-500)", stroke: "var(--olive-800)", strokeWidth: 1.2, transformOrigin: "0px -8px" }}
              initial={{ scale: 0, y: 0, opacity: 1 }}
              animate={leaving ? { y: -30, opacity: 0, transition: { duration: 0.4, ease: EASING.exit, delay: i * 0.05 } } : { scale: 1, transition: { duration: 0.7, ease: EASING.pop, delay: i * 0.08 } }}
            />
          </g>
        ))}
        <circle r="7" style={{ fill: "var(--olive-800)" }} />
      </motion.svg>
      <h1 className="a-title text-[1.9rem]">
        Preparando su <em>diagnóstico</em>
      </h1>
      <div className="relative h-[1.6em] w-full overflow-hidden font-bold text-ink-soft">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={line}
            className="absolute inset-x-0"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1, transition: { duration: 0.35, ease: EASING.enter } }}
            exit={{ y: "-100%", opacity: 0, transition: { duration: 0.3, ease: EASING.exit } }}
          >
            Revisando {axes[line]?.toLowerCase()}…
          </motion.span>
        </AnimatePresence>
      </div>
    </section>
  );
}
