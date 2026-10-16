"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";

/* GUIA_VISUAL §8.5 / §9.4 — alerta crítica: rosa, ícono y título en negrita.
   Entra con la sacudida de "bloqueado" (x −6 → 0, elástica). */
export function CriticalAlert({ title, children, action, icon = "alert" }: { title: string; children: ReactNode; action?: ReactNode; icon?: IconName }) {
  return (
    <motion.div
      role="alert"
      className="flex gap-[0.8rem] rounded-button border border-rose-300 bg-rose-100 p-4"
      initial={{ opacity: 0, x: -6 }}
      whileInView={{ opacity: 1, x: [-6, 6, -3, 0] }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="mt-[0.05rem] text-rose-600">
        <Icon name={icon} size="1.4rem" />
      </span>
      <div className="flex flex-col gap-1 text-[0.92rem] leading-[1.45]">
        <p className="font-extrabold text-ink">{title}</p>
        <p>{children}</p>
        {action}
      </div>
    </motion.div>
  );
}
