"use client";
/* Estados de carga (GUIA_VISUAL §6 flor de 4 pétalos, §9.4 "Analizando").
   El esqueleto usa la clase .skeleton (brillo definido en globals.css). */
import { motion } from "framer-motion";
import { EASING, STAGGER } from "@/design/motion-react";

const PETAL = "M0 -8 C 22 -30, 24 -64, 0 -88 C -24 -64, -22 -30, 0 -8 Z";

/** Flor de marca: pétalos que aparecen escalonados y giran (preloader de la maqueta). */
export function FlowerLoader({ size = 88, label = "Cargando" }: { size?: number; label?: string }) {
  return (
    <motion.svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      animate={{ rotate: 360 }}
      transition={{ duration: 2.6, ease: EASING.move, repeat: Infinity }}
    >
      {[0, 90, 180, 270].map((r, i) => (
        <g key={r} transform={`rotate(${r})`}>
          <motion.path
            d={PETAL}
            style={{ fill: "var(--rose-500)", stroke: "var(--olive-800)", strokeWidth: 1.4, transformOrigin: "0px -8px" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1, 1, 0.85], opacity: [0, 1, 1, 0.6] }}
            transition={{ duration: 2.6, times: [0, 0.3, 0.75, 1], delay: i * STAGGER.petals, repeat: Infinity, ease: EASING.enter }}
          />
        </g>
      ))}
      <circle r="7" style={{ fill: "var(--olive-800)" }} />
    </motion.svg>
  );
}

/** Pantalla de carga de ruta: flor + marca + frase. */
export function PageLoading({ message = "Preparando su información…" }: { message?: string }) {
  return (
    <div className="grid min-h-[60dvh] place-content-center justify-items-center gap-5 text-center" aria-busy="true">
      <FlowerLoader />
      <p className="brand text-[1.6rem] leading-none">
        smile<span className="dot">.</span>
      </p>
      <motion.p
        className="text-app-small text-ink-soft"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASING.enter, delay: 0.2 }}
      >
        {message}
      </motion.p>
    </div>
  );
}

/** Bloque gris con brillo para contenido que llega. */
export function Skeleton({ className = "", rounded = "var(--radius-card)" }: { className?: string; rounded?: string }) {
  return <div className={`skeleton ${className}`} style={{ borderRadius: rounded }} aria-hidden="true" />;
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="grid gap-2" aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skeleton h-3" style={{ width: `${100 - i * 14}%`, borderRadius: "var(--radius-pill)" }} />
      ))}
    </div>
  );
}
