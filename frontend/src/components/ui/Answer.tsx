"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState, type ButtonHTMLAttributes, type PointerEvent } from "react";
import { Icon, type IconName } from "@/components/icons";
import { EASING, PRESS, SPRING } from "@/design/motion-react";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.4 / §9.4 — respuesta de la autoevaluación: botón de 74 px,
   texto grande e ícono en círculo. Al elegirla, el relleno oliva crece como un
   círculo desde el punto tocado (clip-path, 0.65 s) y el check aparece con
   impulso (back.out). aria-pressed anuncia la elección. */
type Kind = "si" | "no" | "na";
const ICON: Record<Kind, IconName> = { si: "si", no: "no", na: "na" };
const ICON_BG: Record<Kind, string> = {
  si: "bg-olive-100 text-olive-800",
  no: "bg-cream-200 text-ink",
  na: "bg-rose-100 text-rose-700",
};

type NativeProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDrag" | "onDragStart" | "onDragEnd">;
export interface AnswerProps extends NativeProps {
  selected: boolean;
  kind?: Kind;
}

export function Answer({ selected, kind, className, children, type = "button", onPointerDown, ...rest }: AnswerProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [origin, setOrigin] = useState({ x: "20%", y: "50%" });

  const remember = (e: PointerEvent<HTMLButtonElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setOrigin({ x: `${e.clientX - r.left}px`, y: `${e.clientY - r.top}px` });
    onPointerDown?.(e);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      aria-pressed={selected}
      whileTap={{ scale: PRESS.card }}
      transition={SPRING}
      onPointerDown={remember}
      className={cn(
        "relative flex min-h-[4.6rem] w-full items-center gap-4 overflow-hidden rounded-card border-[1.5px] pr-5 pl-3 text-left",
        "text-app-answer font-extrabold transition-[border-color,color] duration-[var(--dur-s)]",
        "[-webkit-tap-highlight-color:transparent]",
        selected ? "border-transparent bg-white text-cream delay-100" : "border-line bg-white text-ink hover:border-olive-300",
        className,
      )}
      {...rest}
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 z-[1] bg-olive-800"
        initial={false}
        animate={{ clipPath: selected ? `circle(150% at ${origin.x} ${origin.y})` : `circle(0% at ${origin.x} ${origin.y})` }}
        transition={{ duration: selected ? 0.65 : 0.3, ease: selected ? [0.215, 0.61, 0.355, 1] : EASING.exit }}
      />
      {kind ? (
        <motion.span
          aria-hidden
          className={cn("relative z-[2] grid size-[3.1rem] shrink-0 place-items-center rounded-full transition-colors duration-[var(--dur-s)]", selected ? "bg-cream text-olive-900" : ICON_BG[kind])}
          animate={selected ? { scale: [0.8, 1] } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 12 }}
        >
          <Icon name={ICON[kind]} size="1.6rem" />
        </motion.span>
      ) : null}
      <span className="relative z-[2]">{children}</span>
      <AnimatePresence>
        {selected ? (
          <motion.span
            key="check"
            aria-hidden
            className="relative z-[2] ml-auto inline-flex"
            initial={{ scale: 0, rotate: -40, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1, transition: { duration: 0.6, ease: [0.34, 1.8, 0.64, 1], delay: 0.08 } }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
          >
            <Icon name="check" size="1.6rem" />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}
