"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { CountUp } from "@/components/motion";
import { T } from "@/design/motion-react";

/* GUIA_VISUAL §8.5 / §9.4 — anillo del Pilar 1: radio 84 en viewBox 200, trazo
   14, pista oliva clara, degradado rosa → oliva, marcas de escala en crema. El
   trazo se llena en 2.2 s (expo.out, +0.2 s) mientras el número cuenta. */
const RADIUS = 84;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TICKS = Array.from({ length: 10 }, (_, i) => i * 36);

export function ScoreRing({ score, delay = 0.2 }: { score: number; delay?: number }) {
  const gradientId = useId();
  const rounded = Math.round(score);

  return (
    <figure role="img" aria-label={`Puntaje ${rounded} de 100`} className="relative mx-auto grid size-[13.2rem] place-items-center">
      <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90 overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--rose-500)" }} />
            <stop offset="100%" style={{ stopColor: "var(--olive-600)" }} />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r={RADIUS} fill="none" strokeWidth="14" className="stroke-olive-100" />
        <motion.circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - score / 100) }}
          transition={{ ...T.count, delay }}
        />
        <g>
          {TICKS.map((deg) => (
            <line key={deg} x1="100" y1="9" x2="100" y2="23" strokeWidth="1.8" transform={`rotate(${deg} 100 100)`} style={{ stroke: "var(--cream)" }} />
          ))}
        </g>
      </svg>
      <figcaption aria-hidden className="flex flex-col items-center">
        <span className="font-display text-app-score leading-[0.9] font-[330] tracking-[-0.05em]">
          <CountUp value={rounded} />
        </span>
        <span className="mt-1 text-[0.8rem] font-bold text-ink-soft">de 100</span>
      </figcaption>
    </figure>
  );
}
