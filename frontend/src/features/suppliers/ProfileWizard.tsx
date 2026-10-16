"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icons";
import { Button, Choice, Field, SelectField } from "@/components/ui";
import { CATEGORIES, DEPARTMENTS, municipalitiesOf } from "@/data/catalog/local";
import { STEPS, validateStep, type ProfileError, type ProfileErrors, type Step, type SupplierProfile } from "@/domain/suppliers/profile";
import { useSaveProfile } from "./hooks";

/* CU-04 · HU-SUP-01. Ficha en pasos cortos (U-01) con autoguardado al avanzar
   (U-07); funciona igual sin conexión. */
const ORDER = Object.keys(STEPS) as Step[];
const TITLE: Record<Step, string> = { identificacion: "Identificación", ubicacion: "Ubicación", contacto: "Contacto y categoría" };

const MESSAGE: Record<ProfileError, string> = {
  required: "Este dato es obligatorio.",
  invalid_nit: "Escriba el número sin el dígito de verificación: entre 5 y 15 cifras.",
  nit_check_digit_mismatch: "El dígito de verificación no coincide. Revíselo en su RUT.",
  legal_rep_required: "Para persona jurídica, escriba el nombre del representante legal.",
  invalid_divipola: "Elija un municipio del departamento seleccionado.",
};

export function ProfileWizard({ initial, onDone }: { initial: SupplierProfile; onDone: () => void }) {
  const save = useSaveProfile();
  const [profile, setProfile] = useState(initial);
  const [index, setIndex] = useState(0);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saving, setSaving] = useState(false);
  const step = ORDER[index]!;
  const last = index === ORDER.length - 1;

  const set = <K extends keyof SupplierProfile>(key: K, value: SupplierProfile[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const error = (key: keyof SupplierProfile) => (errors[key] ? MESSAGE[errors[key]] : null);

  const next = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateStep(step, profile);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      await save(profile);
    } finally {
      setSaving(false);
    }
    if (last) onDone();
    else setIndex(index + 1);
  };

  return (
    <form onSubmit={next} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="a-eyebrow">
          Su ficha · paso {index + 1} de {ORDER.length}
        </p>
        <h1 className="a-title">{TITLE[step]}</h1>
      </div>

      {step === "identificacion" ? (
        <>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-app-small font-bold">Tipo de persona</legend>
            <Choice name="personType" checked={profile.personType === "natural"} onChange={() => set("personType", "natural")}>
              Persona natural
            </Choice>
            <Choice name="personType" checked={profile.personType === "juridica"} onChange={() => set("personType", "juridica")}>
              Persona jurídica (empresa)
            </Choice>
            {error("personType") ? <p className="text-app-caption font-bold text-rose-700">{error("personType")}</p> : null}
          </fieldset>
          <div className="grid grid-cols-[1fr_6.5rem] gap-3">
            <Field label="NIT o cédula" inputMode="numeric" value={profile.taxId} onChange={(e) => set("taxId", e.target.value)} error={error("taxId")} />
            <Field label="DV" inputMode="numeric" maxLength={1} value={profile.taxDv} onChange={(e) => set("taxDv", e.target.value)} error={error("taxDv")} />
          </div>
          <Field
            label={profile.personType === "juridica" ? "Razón social" : "Nombre completo"}
            autoComplete="name"
            value={profile.legalName}
            onChange={(e) => set("legalName", e.target.value)}
            error={error("legalName")}
          />
          {profile.personType === "juridica" ? (
            <Field label="Representante legal" value={profile.legalRep} onChange={(e) => set("legalRep", e.target.value)} error={error("legalRep")} />
          ) : null}
        </>
      ) : null}

      {step === "ubicacion" ? (
        <>
          <SelectField
            label="Departamento"
            placeholder="Elija el departamento"
            value={profile.departmentCode}
            onChange={(e) => {
              set("departmentCode", e.target.value);
              set("municipalityCode", "");
            }}
            options={DEPARTMENTS.map((d) => ({ value: d.code, label: d.name }))}
            error={error("departmentCode")}
          />
          <SelectField
            label="Municipio"
            placeholder={profile.departmentCode ? "Elija el municipio" : "Primero elija el departamento"}
            disabled={!profile.departmentCode}
            value={profile.municipalityCode}
            onChange={(e) => set("municipalityCode", e.target.value)}
            options={municipalitiesOf(profile.departmentCode).map((m) => ({ value: m.code, label: m.name }))}
            error={error("municipalityCode")}
          />
          <Field label="Vereda (opcional)" value={profile.vereda} onChange={(e) => set("vereda", e.target.value)} />
        </>
      ) : null}

      {step === "contacto" ? (
        <>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-app-small font-bold">¿Cómo prefiere que lo contactemos?</legend>
            {(
              [
                ["whatsapp", "WhatsApp"],
                ["llamada", "Llamada"],
                ["correo", "Correo"],
              ] as const
            ).map(([value, label]) => (
              <Choice key={value} name="contactChannel" checked={profile.contactChannel === value} onChange={() => set("contactChannel", value)}>
                {label}
              </Choice>
            ))}
            {error("contactChannel") ? <p className="text-app-caption font-bold text-rose-700">{error("contactChannel")}</p> : null}
          </fieldset>
          <SelectField
            label="Categoría principal"
            placeholder="Elija su categoría"
            value={profile.mainCategory}
            onChange={(e) => set("mainCategory", e.target.value)}
            options={CATEGORIES.map((c) => ({
              value: c.code,
              label: c.status === "ACTIVA" ? c.name : `${c.name} (próximamente)`,
              disabled: c.status !== "ACTIVA",
            }))}
            error={error("mainCategory")}
          />
        </>
      ) : null}

      <Button type="submit" disabled={saving} icon={<Icon name={last ? "check" : "arrow"} />}>
        {last ? "Guardar ficha" : "Siguiente"}
      </Button>
      {index > 0 ? (
        <Button variant="ghost" onClick={() => setIndex(index - 1)}>
          Volver
        </Button>
      ) : null}
    </form>
  );
}
