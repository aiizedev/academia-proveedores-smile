"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { motion } from "framer-motion";
import { MaskWords, Skeleton, Stagger, StaggerItem } from "@/components/motion";
import { Button, Card } from "@/components/ui";
import { CATEGORIES, DEPARTMENTS, MUNICIPALITIES } from "@/data/catalog/local";
import type { SupplierProfile } from "@/domain/suppliers/profile";
import { useLocalProfile } from "./hooks";
import { ProfileWizard } from "./ProfileWizard";

/* /app/ficha: resumen si la ficha está completa; si no, el asistente. */
const CHANNEL = { whatsapp: "WhatsApp", llamada: "Llamada", correo: "Correo" } as const;

function Summary({ profile, onEdit }: { profile: SupplierProfile; onEdit: () => void }) {
  const place = [
    MUNICIPALITIES.find((m) => m.code === profile.municipalityCode)?.name,
    DEPARTMENTS.find((d) => d.code === profile.departmentCode)?.name,
  ]
    .filter(Boolean)
    .join(", ");
  const rows: Array<[string, string]> = [
    ["Nombre", profile.legalName],
    ["NIT o cédula", `${profile.taxId}-${profile.taxDv}`],
    ["Ubicación", profile.vereda ? `${profile.vereda} · ${place}` : place],
    ["Contacto", profile.contactChannel ? CHANNEL[profile.contactChannel] : ""],
    ["Categoría", CATEGORIES.find((c) => c.code === profile.mainCategory)?.name ?? ""],
  ];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="a-eyebrow">Su ficha</p>
        <MaskWords text="Ficha guardada" emphasis={["guardada"]} className="a-title" />
        <motion.p role="status" className="inline-flex items-center gap-2 text-app-small font-bold text-olive-700" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <Icon name="cloudOk" size="1.1rem" /> Guardada en su teléfono. Se enviará cuando haya señal.
        </motion.p>
      </div>
      <Card className="overflow-hidden !p-0">
        <div className="grain relative overflow-hidden bg-olive-800 px-5 pt-4 pb-5 text-cream">
          <span aria-hidden className="absolute -right-9 -bottom-11 size-32 rounded-[var(--leaf-shape)] bg-olive-600 opacity-60" />
          <p className="brand relative z-[2] text-[1.3rem] leading-none">
            smile<span className="dot">.</span>
          </p>
          <p className="relative z-[2] mt-4 font-display text-[1.6rem] leading-[1.05] tracking-[-0.025em]">{profile.legalName}</p>
          <p className="relative z-[2] mt-1 text-app-caption text-olive-300">{rows[2]?.[1]}</p>
        </div>
        <Stagger className="flex flex-col p-5" gap={0.06} delay={0.2}>
          {rows.map(([label, value]) => (
            <StaggerItem key={label} className="flex items-baseline justify-between gap-3 border-b border-line py-2 last:border-0">
              <span className="text-app-caption text-ink-soft">{label}</span>
              <span className="text-right text-app-body font-bold">{value}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </Card>
      <Button variant="ghost" onClick={onEdit}>
        Editar ficha
      </Button>
    </section>
  );
}

export function ProfileScreen() {
  const local = useLocalProfile();
  const [editing, setEditing] = useState(false);

  if (local.status === "loading") {
    return (
      <div className="flex flex-col gap-4 pt-2" aria-busy="true">
        <Skeleton className="h-4 w-24" rounded="var(--radius-pill)" />
        <Skeleton className="h-10 w-52" rounded="var(--radius-m)" />
        <Skeleton className="h-72" />
      </div>
    );
  }
  if (local.completedAt !== null && !editing) return <Summary profile={local.profile} onEdit={() => setEditing(true)} />;
  return <ProfileWizard initial={local.profile} onDone={() => setEditing(false)} />;
}
