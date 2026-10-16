"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { PRESET } from "@/design/motion";
import { EASING } from "@/design/motion-react";

/* GUIA_VISUAL §8.11 / §9.4 — toast: píldora oliva oscura sobre la tabbar.
   Entra subiendo (y 30, scale .9 → 1, 0.6 s), se queda 2,3 s y sale (y 20,
   0.4 s power2.in); avisa a `onDone` al terminar de salir. role="status" lo anuncia. */
export function Toast({ message, onDone, icon = "check" }: { message: string; onDone: () => void; icon?: IconName }) {
  const [shown, setShown] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setShown(false), PRESET.toastHold * 1000);
    return () => clearTimeout(id);
  }, []);
  return (
    <AnimatePresence onExitComplete={onDone}>
      {shown ? (
        <motion.div
          role="status"
          data-print="hidden"
          initial={{ y: 30, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASING.enter } }}
          exit={{ y: 20, opacity: 0, transition: { duration: 0.4, ease: EASING.exit } }}
          className="fixed inset-x-0 bottom-[calc(6.6rem+env(safe-area-inset-bottom,0px))] z-[var(--z-toast)] mx-auto flex w-max max-w-[calc(100%-2.4rem)] items-center gap-[0.6rem] rounded-pill bg-olive-900 py-3 pr-[1.1rem] pl-[0.8rem] text-[0.85rem] font-bold text-cream shadow-float"
        >
          <motion.span className="text-rose-500" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.6, ease: [0.34, 1.8, 0.64, 1], delay: 0.15 }}>
            <Icon name={icon} size="1.2rem" />
          </motion.span>
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
