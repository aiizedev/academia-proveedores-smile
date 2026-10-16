"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Button, Checkbox } from "@/components/ui";
import type { ConsentText } from "@/domain/privacy/consent";
import { GENERAL_TEXT, SENSITIVE_TEXT, useRecordConsent } from "./hooks";

/* CU-03: autorización general (obligatoria) y, en otra pantalla, la de datos
   sensibles (opcional). Una decisión por pantalla (U-01). */
type Step = "general" | "declined" | "sensitive";

function ConsentBody({ text }: { text: ConsentText }) {
  return (
    <>
      <h1 className="a-title">{text.title}</h1>
      <div className="flex flex-col gap-3 text-app-body">
        {text.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p className="text-app-caption text-ink-soft">Versión {text.version}</p>
    </>
  );
}

export function ConsentFlow() {
  const router = useRouter();
  const record = useRecordConsent();
  const [step, setStep] = useState<Step>("general");
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  const decide = async (text: ConsentText, decision: "granted" | "denied", next: () => void) => {
    setSaving(true);
    try {
      await record(text, decision);
      next();
    } finally {
      setSaving(false);
    }
  };

  if (step === "declined") {
    return (
      <section className="flex flex-col gap-4">
        <p className="a-eyebrow">Sus datos</p>
        <h1 className="a-title">Sin su autorización no podemos guardar información</h1>
        <p className="text-app-body">Si tiene dudas, escríbanos y le explicamos cómo usamos sus datos.</p>
        <a
          href="mailto:sostenibilidad@smilebogota.com"
          className="inline-flex min-h-[3.7rem] items-center justify-center gap-3 rounded-button bg-olive-800 px-[1.4rem] text-app-button font-extrabold text-cream"
        >
          Hablar con Smile
          <Icon name="chat" size="1.3rem" />
        </a>
        <Button variant="ghost" onClick={() => setStep("general")}>
          Volver a leer la autorización
        </Button>
      </section>
    );
  }

  if (step === "sensitive") {
    return (
      <section className="flex flex-col gap-4">
        <p className="a-eyebrow">Sus datos · 2 de 2</p>
        <ConsentBody text={SENSITIVE_TEXT} />
        <Button disabled={saving} onClick={() => decide(SENSITIVE_TEXT, "granted", () => router.replace("/app"))}>
          Autorizo
        </Button>
        <Button variant="ghost" disabled={saving} onClick={() => decide(SENSITIVE_TEXT, "denied", () => router.replace("/app"))}>
          No autorizo
        </Button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <p className="a-eyebrow">Sus datos · 1 de 2</p>
      <ConsentBody text={GENERAL_TEXT} />
      <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>
        {GENERAL_TEXT.accept_label}
      </Checkbox>
      <Button disabled={!checked || saving} onClick={() => decide(GENERAL_TEXT, "granted", () => setStep("sensitive"))}>
        Acepto
      </Button>
      <Button variant="ghost" onClick={() => setStep("declined")}>
        No acepto
      </Button>
    </section>
  );
}
