"use client";

import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";
import { useLocalDb } from "@/data/db/context";
import { flushLocalDb } from "@/data/db/flush";
import type { Consent } from "@/data/db/models";
import { hasCurrentConsent, type ConsentDecision, type ConsentText } from "@/domain/privacy/consent";
import { CONSENT_TEXTS } from "@/domain/privacy/texts";

export const GENERAL_TEXT = CONSENT_TEXTS.texts.find((t) => t.kind === "general")!;
export const SENSITIVE_TEXT = CONSENT_TEXTS.texts.find((t) => t.kind === "sensitive")!;

export type ConsentStatus = "loading" | "missing" | "granted";

/** Observa los consentimientos locales: la UI reacciona sin pedir nada a la API (RF-SYN-001). */
export function useConsentStatus(): ConsentStatus {
  const db = useLocalDb();
  const [status, setStatus] = useState<ConsentStatus>("loading");

  useEffect(() => {
    if (db.status !== "ready") return;
    const subscription = db.database
      .get<Consent>("consents")
      .query(Q.where("kind", "general"))
      .observe()
      .subscribe((rows) => setStatus(hasCurrentConsent(rows.map((r) => r.toRecord()), GENERAL_TEXT) ? "granted" : "missing"));
    return () => subscription.unsubscribe();
  }, [db]);

  return status;
}

/** Registra una decisión inmutable (CU-03 paso 6); entra a la cola P2 por su tabla. */
export function useRecordConsent() {
  const db = useLocalDb();
  return async (text: ConsentText, decision: ConsentDecision): Promise<void> => {
    if (db.status !== "ready") throw new Error("La base local todavía no está lista");
    const { database } = db;
    await database.write(() =>
      database.get<Consent>("consents").create((c) => {
        c._setRaw("consent_text_id", text.id);
        c._setRaw("kind", text.kind);
        c._setRaw("decision", decision);
        c._setRaw("method", "checkbox");
        c._setRaw("text_version", text.version);
        c._setRaw("text_sha256", text.sha256);
        c._setRaw("device_at", Date.now());
      }),
    );
    // Evidencia legal: debe quedar en disco antes de salir de la pantalla.
    await flushLocalDb(database);
  };
}
