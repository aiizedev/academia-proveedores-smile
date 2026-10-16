"use client";

import { useEffect } from "react";
import { Icon } from "@/components/icons";
import { PRESET } from "@/design/motion";

/* GUIA_VISUAL §8.11 — toast: píldora oliva oscura sobre la tabbar; se queda
   2,3 s (PRESET.toastHold) y se va. role="status" lo anuncia. */

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, PRESET.toastHold * 1000);
    return () => clearTimeout(id);
  }, [onDone]);
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-[calc(6.6rem+env(safe-area-inset-bottom,0px))] z-[var(--z-toast)] mx-auto flex w-fit items-center gap-2 rounded-pill bg-olive-900 px-4 py-3 text-app-small font-bold text-cream shadow-float"
    >
      <span className="text-rose-500">
        <Icon name="check" size="1.1rem" />
      </span>
      {message}
    </div>
  );
}
