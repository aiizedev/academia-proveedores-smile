/* Reglas del consentimiento (RF-PRV-001, RF-PRV-003, CU-03). Puras: sin React
   ni base de datos. El backend valida el mismo hash con contracts/fixtures. */

export type ConsentKind = "general" | "sensitive";
export type ConsentDecision = "granted" | "denied";

export interface ConsentText {
  id: string;
  kind: ConsentKind;
  version: string;
  title: string;
  body: string[];
  accept_label: string;
  sha256: string;
}

export interface ConsentRecord {
  kind: ConsentKind;
  decision: ConsentDecision;
  textSha256: string;
  deviceAt: number;
}

/** Forma canónica que se firma: párrafos unidos por una línea en blanco. */
export function canonicalText(text: Pick<ConsentText, "body">): string {
  return text.body.join("\n\n");
}

/** SHA-256 en hexadecimal del texto canónico (WebCrypto: navegador y Node). */
export async function digestText(text: Pick<ConsentText, "body">): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalText(text));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Última decisión registrada para un tipo de texto, o null si no hay. Append-only: manda la más reciente. */
export function latestDecision(records: readonly ConsentRecord[], kind: ConsentKind): ConsentRecord | null {
  return records
    .filter((r) => r.kind === kind)
    .reduce<ConsentRecord | null>((latest, r) => (latest === null || r.deviceAt >= latest.deviceAt ? r : latest), null);
}

/** La captura se habilita solo con autorización general vigente para el texto actual. */
export function hasCurrentConsent(records: readonly ConsentRecord[], current: Pick<ConsentText, "sha256">): boolean {
  const latest = latestDecision(records, "general");
  return latest !== null && latest.decision === "granted" && latest.textSha256 === current.sha256;
}
