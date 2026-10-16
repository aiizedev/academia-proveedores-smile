import { describe, expect, it } from "vitest";
import fixture from "../../../../contracts/fixtures/consent-text.json";
import { digestText, hasCurrentConsent, type ConsentRecord } from "./consent";
import { CONSENT_TEXTS } from "./texts";

const general = CONSENT_TEXTS.texts.find((t) => t.kind === "general")!;
const record = (over: Partial<ConsentRecord>): ConsentRecord => ({
  kind: "general",
  decision: "granted",
  textSha256: general.sha256,
  deviceAt: 1,
  ...over,
});

describe("texto de autorización (fixture compartido)", () => {
  it("el texto embebido es idéntico al de contracts/", () => {
    expect(CONSENT_TEXTS).toEqual({ current_version: fixture.current_version, texts: fixture.texts });
  });

  it("el hash SHA-256 de cada texto coincide con el publicado", async () => {
    for (const text of fixture.texts) expect(await digestText(text)).toBe(text.sha256);
  });

  it("menciona responsable, derechos y canal de contacto (RF-PRV-001)", () => {
    const body = general.body.join(" ");
    for (const required of ["Grupo Smile Bogotá S.A.S.", "conocer", "actualizar", "rectificar", "suprimir", "revocar", "sostenibilidad@smilebogota.com"]) {
      expect(body).toContain(required);
    }
  });
});

describe("consentimiento vigente (CU-03)", () => {
  it("sin registros la captura queda bloqueada", () => {
    expect(hasCurrentConsent([], general)).toBe(false);
  });

  it("acepta la autorización general del texto actual", () => {
    expect(hasCurrentConsent([record({})], general)).toBe(true);
  });

  it("no vale una aceptación de otra versión del texto", () => {
    expect(hasCurrentConsent([record({ textSha256: "otro" })], general)).toBe(false);
  });

  it("manda la decisión más reciente y el consentimiento sensible no cuenta", () => {
    expect(hasCurrentConsent([record({ deviceAt: 1 }), record({ decision: "denied", deviceAt: 2 })], general)).toBe(false);
    expect(hasCurrentConsent([record({ kind: "sensitive" })], general)).toBe(false);
  });
});
