"use client";
/* Primitivos de movimiento (GUIA_VISUAL §9, Framer Motion). Uso:
   <MotionRoot> en el layout · <PageTransition> en template.tsx ·
   <Reveal>, <Stagger>/<StaggerItem>, <MaskWords>, <CountUp>, <Pressable>. */
import {
  animate,
  motion,
  MotionConfig,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type HTMLMotionProps,
} from "framer-motion";
import { Fragment, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import {
  maskUpVariants,
  pageVariants,
  PRESS,
  revealVariants,
  SPRING,
  STAGGER,
  staggerVariants,
  T,
} from "@/design/motion-react";

/** Respeta prefers-reduced-motion en toda la app (GUIA_VISUAL §10.3). */
export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Entrada de página. Úsese en template.tsx para que corra en cada navegación. */
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={pageVariants} initial="initial" animate="enter">
      {children}
    </motion.div>
  );
}

type RevealProps = HTMLMotionProps<"div"> & { delay?: number; once?: boolean };
/** Aparece al entrar en pantalla (y 30 → 0, expo.out). */
export function Reveal({ children, delay = 0, once = true, ...rest }: RevealProps) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "0px 0px -10% 0px" }}
      transition={{ ...T.reveal, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = HTMLMotionProps<"div"> & { gap?: number; delay?: number; inView?: boolean };
/** Contenedor que escalona a sus <StaggerItem>. */
export function Stagger({ children, gap = STAGGER.base, delay = 0.05, inView = false, ...rest }: StaggerProps) {
  const trigger = inView
    ? { whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } }
    : { animate: "show" };
  return (
    <motion.div variants={staggerVariants(gap, delay)} initial="hidden" {...trigger} {...rest}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...rest }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={revealVariants} {...rest}>
      {children}
    </motion.div>
  );
}

/** Titular cuyas palabras suben desde una máscara. Conserva el texto accesible. */
export function MaskWords({
  text,
  className,
  as = "h1",
  emphasis,
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  /** Palabra(s) que van en cursiva rosa (firma tipográfica, GUIA_VISUAL §4). */
  emphasis?: string[];
  delay?: number;
}) {
  const Tag = motion[as];
  const words = text.split(" ");
  return (
    <Tag
      className={className}
      aria-label={text}
      variants={staggerVariants(STAGGER.words * 2, delay)}
      initial="hidden"
      animate="show"
    >
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span aria-hidden="true" className="inline-block overflow-hidden pb-[0.1em] pr-[0.04em] align-bottom">
            <motion.span className="inline-block" variants={maskUpVariants}>
              {emphasis?.includes(w.replace(/[.,:;!?¿¡]/g, "")) ? <em>{w}</em> : w}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Número que cuenta hasta su valor al entrar en pantalla (contadores §9.4). */
export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  format,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (n) =>
    format ? format(n) : `${prefix}${n.toLocaleString("es-CO", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}${suffix}`,
  );
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      mv.set(value);
      return;
    }
    const c = animate(mv, value, T.count);
    return () => c.stop();
  }, [inView, value, reduced, mv]);
  return (
    <motion.span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {text}
    </motion.span>
  );
}

type PressableProps = HTMLMotionProps<"div"> & { kind?: keyof typeof PRESS };
/** Superficie que se hunde al presionar y se eleva levemente al pasar el puntero. */
export function Pressable({ children, kind = "card", ...rest }: PressableProps) {
  return (
    <motion.div whileTap={{ scale: PRESS[kind] }} whileHover={{ y: -2 }} transition={SPRING} {...rest}>
      {children}
    </motion.div>
  );
}

/** Barra que crece desde su origen al entrar en pantalla (barras por eje, pilares, líneas de pasos).
 *  El disparo lo observa la pista: una marca escalada a 0 no tiene área y el
 *  IntersectionObserver no siempre la reporta. */
export function GrowBar({
  className,
  trackStyle,
  fillClassName,
  fillStyle,
  to = 1,
  delay = 0,
  axis = "x",
  duration,
  ease,
}: {
  className?: string;
  trackStyle?: CSSProperties;
  fillClassName?: string;
  fillStyle?: CSSProperties;
  to?: number;
  delay?: number;
  axis?: "x" | "y";
  duration?: number;
  ease?: readonly [number, number, number, number];
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -6% 0px" });
  const key = axis === "x" ? "scaleX" : "scaleY";
  return (
    <span ref={ref} aria-hidden="true" className={className} style={trackStyle}>
      <motion.span
        className={`block ${axis === "x" ? "origin-left" : "origin-top"} ${fillClassName ?? ""}`}
        style={fillStyle}
        initial={{ [key]: 0 }}
        animate={seen ? { [key]: to } : undefined}
        transition={{ ...T.bar, ...(duration ? { duration } : {}), ...(ease ? { ease } : {}), delay }}
      />
    </span>
  );
}

export { Skeleton, SkeletonText, FlowerLoader, PageLoading } from "./loading";
