/* Movimiento para React con Framer Motion (GUIA_VISUAL §9, v1.2).
   Mismas curvas y duraciones que motion.ts / docs/diseno/motion.js:
   las leyes de §9.1 siguen igual (entra lento, sale rápido, revelar desde
   máscara, escalonar siempre, elástico solo como respuesta al dedo). */
import type { Transition, Variants } from "framer-motion";
import { DUR, STAGGER } from "./motion";

/** Curvas cúbicas equivalentes a las de GSAP (tokens --ease-* de tokens.css). */
export const EASING = {
  enter: [0.16, 1, 0.3, 1], // expo.out
  move: [0.87, 0, 0.13, 1], // expo.inOut
  exit: [0.55, 0, 1, 0.45], // power2.in
  ui: [0.22, 1, 0.36, 1], // --ease-out
  pop: [0.34, 1.56, 0.64, 1], // back.out(2)
} as const satisfies Record<string, readonly [number, number, number, number]>;

/** Resorte para feedback táctil (equivale a elastic.out(1, 0.4) en intención). */
export const SPRING = { type: "spring", stiffness: 520, damping: 22, mass: 0.7 } as const satisfies Transition;
/** Resorte suave para indicadores que se desplazan (píldora de tabs, selección). */
export const GLIDE = { type: "spring", stiffness: 380, damping: 34 } as const satisfies Transition;

export const T = {
  enter: { duration: DUR.enter, ease: EASING.enter },
  exit: { duration: DUR.exit, ease: EASING.exit },
  reveal: { duration: DUR.l, ease: EASING.enter },
  headline: { duration: DUR.headline, ease: EASING.enter },
  bar: { duration: DUR["2xl"], ease: EASING.enter },
  count: { duration: DUR.count, ease: EASING.enter },
  ui: { duration: DUR.s, ease: EASING.ui },
  pop: { duration: DUR.l, ease: EASING.pop },
} as const satisfies Record<string, Transition>;

/** Transición de página: entra desde abajo con leve desplazamiento, sale hacia arriba. */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 18 },
  enter: { opacity: 1, y: 0, transition: T.enter },
  exit: { opacity: 0, y: -10, transition: T.exit },
};

/** Revelado genérico [data-reveal] (§9.5): y 30 → 0. */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: T.reveal },
};

/** Contenedor que escalona a sus hijos. */
export const staggerVariants = (stagger: number = STAGGER.base, delayChildren = 0.05): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Texto que sube desde una máscara (SplitText → palabras). */
export const maskUpVariants: Variants = {
  hidden: { y: "110%", rotate: 2.5 },
  show: { y: "0%", rotate: 0, transition: T.headline },
};

/** Aparición con impulso para íconos, insignias y nodos. */
export const popVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -12 },
  show: { opacity: 1, scale: 1, rotate: 0, transition: T.pop },
};

/** Escala al presionar (GUIA_VISUAL §9.6): botón .97, tarjeta .98, ícono .92. */
export const PRESS = { button: 0.97, card: 0.98, icon: 0.92 } as const;

export { DUR, STAGGER };
