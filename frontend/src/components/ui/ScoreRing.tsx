"use client";

import { useEffect, useId, useState } from "react";

/* GUIA_VISUAL §8.5 — anillo del Pilar 1: radio 84 en viewBox 200, trazo 14,
   pista oliva clara y degradado rosa → oliva. El trazo se llena en 2.2 s
   (§9.4 "Diagnóstico"); con movimiento reducido el CSS global lo deja quieto. */
const RADIUS = 84;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({ score }: { score: number }) {
  const gradientId = useId();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(score));
    return () => cancelAnimationFrame(frame);
  }, [score]);
  const rounded = Math.round(score);

  return (
    <figure role="img" aria-label={`Puntaje ${rounded} de 100`} className="relative mx-auto grid size-[13.2rem] place-items-center">
      <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--rose-500)" }} />
            <stop offset="100%" style={{ stopColor: "var(--olive-600)" }} />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r={RADIUS} fill="none" strokeWidth="14" className="stroke-olive-100" />
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - shown / 100)}
          className="transition-[stroke-dashoffset] duration-[var(--dur-count)] ease-expo-out"
        />
      </svg>
      <figcaption aria-hidden className="flex flex-col items-center">
        <span className="font-display text-app-score leading-none tabular-nums">{rounded}</span>
        <span className="text-app-small text-ink-soft">de 100</span>
      </figcaption>
    </figure>
  );
}
