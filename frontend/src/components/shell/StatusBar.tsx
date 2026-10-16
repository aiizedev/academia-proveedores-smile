"use client";

import Link from "next/link";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";
import { Icon } from "@/components/icons";
import { EASING, T } from "@/design/motion-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { statusLabel } from "@/data/sync/queue";
import { SAVED_EVENT } from "@/lib/saved";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.10 — barra de estado con indicador de guardado (RF-SYN-006).
   La píldora cambia de estado con un cruce y late (scale .86 → 1, elástico)
   cada vez que la base local confirma un guardado. */
export function StatusBar() {
  const online = useOnlineStatus();
  const label = statusLabel(online ? { kind: "saved" } : { kind: "offline" });
  const pulse = useAnimationControls();

  useEffect(() => {
    const beat = () => void pulse.start({ scale: [0.86, 1], transition: { type: "spring", stiffness: 420, damping: 9, mass: 0.6 } });
    window.addEventListener(SAVED_EVENT, beat);
    return () => window.removeEventListener(SAVED_EVENT, beat);
  }, [pulse]);

  return (
    <div
      data-print="hidden"
      className={cn(
        "sticky top-0 z-[var(--z-status)] flex h-[calc(46px+env(safe-area-inset-top,0px))] shrink-0 items-center justify-between px-[var(--screen-x)] pt-[env(safe-area-inset-top,0px)]",
        "bg-[color-mix(in_srgb,var(--cream)_86%,transparent)] [backdrop-filter:var(--blur-dock)] [-webkit-backdrop-filter:var(--blur-dock)]",
        "min-[900px]:h-[52px] min-[900px]:px-[1.6rem] min-[900px]:pt-[6px]",
      )}
    >
      <Link href="/app" aria-label="Inicio de su finca" className="brand text-[1.3rem] leading-none">
        smile<span className="dot">.</span>
      </Link>
      <motion.p
        role="status"
        aria-live="polite"
        animate={pulse}
        className={cn(
          "inline-flex h-[1.65rem] items-center gap-[0.35rem] overflow-hidden rounded-pill pr-[0.75rem] pl-[0.5rem] text-[0.7rem] font-bold",
          "transition-colors duration-[var(--dur-s)]",
          online ? "bg-olive-100 text-olive-800" : "bg-rose-100 text-rose-700",
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={label}
            className="inline-flex items-center gap-[0.35rem] whitespace-nowrap"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: T.enter }}
            exit={{ y: "-110%", opacity: 0, transition: { duration: 0.25, ease: EASING.exit } }}
          >
            <Icon name={online ? "cloudOk" : "wifiOff"} size="0.95rem" />
            {label}
          </motion.span>
        </AnimatePresence>
      </motion.p>
    </div>
  );
}
