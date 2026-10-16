"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

/* GUIA_VISUAL §8.11 / §9.4 — confeti de hojas (12 px, --leaf-shape) en los 5
   colores --confetti-*. Por pieza: x 4–96 %, escala 0.6–1.4, cae con deriva
   ±70 px y giro +240–720°, 1.8–3.2 s, retraso 0–0.5 s. Nunca con movimiento reducido. */
const COLORS = ["var(--confetti-1)", "var(--confetti-2)", "var(--confetti-3)", "var(--confetti-4)", "var(--confetti-5)"];

/** Pseudoaleatorio determinista: mismo confeti en servidor y cliente. */
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function Confetti({ count = 40, delay = 0, seed = 1 }: { count?: number; delay?: number; seed?: number }) {
  const reduced = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (k: number) => rand(seed * 1000 + i * 7 + k);
        return {
          left: 4 + r(1) * 92,
          scale: 0.6 + r(2) * 0.8,
          rotate: r(3) * 360,
          spin: 240 + r(4) * 480,
          drift: (r(5) - 0.5) * 140,
          duration: 1.8 + r(6) * 1.4,
          delay: delay + r(7) * 0.5,
          color: COLORS[i % COLORS.length]!,
        };
      }),
    [count, delay, seed],
  );
  if (reduced) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[var(--z-confetti)] overflow-hidden" data-print="hidden">
      {pieces.map((p, i) => (
        <motion.i
          key={i}
          className="absolute -top-5 block size-3"
          style={{ left: `${p.left}%`, background: p.color, borderRadius: "var(--leaf-shape)" }}
          initial={{ y: -40, x: 0, scale: p.scale, rotate: p.rotate, opacity: 1 }}
          animate={{ y: "110vh", x: p.drift, rotate: p.rotate + p.spin, opacity: [1, 1, 0.9] }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.55, 0.085, 0.68, 0.53] }}
        />
      ))}
    </div>
  );
}
