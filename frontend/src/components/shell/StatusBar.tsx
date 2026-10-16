"use client";

import { Icon } from "@/components/icons";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { statusLabel } from "@/data/sync/queue";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.10 — barra de estado con indicador de guardado (RF-SYN-006).
   En S0 solo refleja la red; en S1 se conecta al estado real de la cola. */
export function StatusBar() {
  const online = useOnlineStatus();
  const label = statusLabel(online ? { kind: "saved" } : { kind: "offline" });

  return (
    <div className="relative z-[var(--z-status)] flex h-[calc(46px+env(safe-area-inset-top,0px))] items-center justify-between px-[var(--screen-x)] pt-[env(safe-area-inset-top,0px)]">
      <p className="brand text-[1.25rem]">
        smile<span className="dot">.</span>
      </p>
      <p
        role="status"
        aria-live="polite"
        className={cn(
          "inline-flex items-center gap-[0.35rem] rounded-pill py-[0.28rem] pr-[0.7rem] pl-2 text-[0.7rem] font-bold",
          "transition-colors duration-[var(--dur-s)]",
          online ? "bg-olive-100 text-olive-800" : "bg-rose-100 text-rose-700",
        )}
      >
        <Icon name={online ? "cloudOk" : "wifiOff"} size="0.95rem" />
        {label}
      </p>
    </div>
  );
}
