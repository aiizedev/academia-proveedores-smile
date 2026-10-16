"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
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
        <h1 className="a-title">
          Ficha <em>guardada</em>
        </h1>
        <p role="status" className="inline-flex items-center gap-2 text-app-small font-bold text-olive-700">
          <Icon name="check" size="1.1rem" /> Guardada en su teléfono. Se enviará cuando haya señal.
        </p>
      </div>
      <Card>
        <dl className="flex flex-col gap-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="text-app-caption text-ink-soft">{label}</dt>
              <dd className="text-app-body font-bold">{value}</dd>
            </div>
          ))}
        </dl>
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

  if (local.status === "loading") return <p className="text-app-body text-ink-soft">Abriendo su ficha…</p>;
  if (local.completedAt !== null && !editing) return <Summary profile={local.profile} onEdit={() => setEditing(true)} />;
  return <ProfileWizard initial={local.profile} onDone={() => setEditing(false)} />;
}
