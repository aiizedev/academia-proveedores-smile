/* Datos de demostración de la PWA (POC, MODO_POC §3): fijos, realistas y
   tipados. Lo nuevo de la demo los lee de aquí; ficha, autoevaluación,
   diagnóstico y plan usan WatermelonDB con el seed de abajo. */
import type { Database } from "@nozbe/watermelondb";
import type { Session } from "@/lib/auth/session";

/** Respuestas del caso 1 de contracts/fixtures/form-paths.json (Fruver micro). Copia: Docker no ve contracts/. */
export const DEMO_ANSWERS: Readonly<Record<string, string | string[]>> = {"amb-01": "si", "amb-02": "si", "amb-03": "si", "amb-04": "si", "amb-05": "no", "amb-06": "si", "amb-07": "no", "amb-08": ["camion_combustion"], "amb-09": "si", "ali-01": "si", "ali-03": "si", "ali-04": "no", "gate-agro": "no", "ext-04": "no", "ext-07": "si", "gate-menores": "no", "soc-01": "si", "soc-02": "si", "soc-03": "no", "soc-04": "si", "soc-05": "si", "soc-06": "si"};

export const DEMO_FARM = { owner: "María Fernanda Rojas", name: "Finca La Esperanza", place: "Vereda El Placer · Fusagasugá, Cundinamarca" };

export const DEMO_SESSION: Session = {
  accessToken: "demo",
  refreshToken: "demo-refresh-token-0000",
  expiresAt: Date.now() + 30 * 24 * 3600_000,
  user: { id: "742aa460-aa7d-56b8-a821-cdc1f42ffa66", fullName: DEMO_FARM.owner, role: "PROVEEDOR", phone: "3001234567", email: "proveedor@smile.test" },
};

/** Siembra la base local una sola vez: ficha, autorización y autoevaluación enviada (caso 1 de form-paths). */
export async function seedDemo(database: Database): Promise<void> {
  const [{ CONSENT_TEXTS }, { cycleFor, DECLARATION }, bank] = await Promise.all([
    import("@/domain/privacy/texts"),
    import("@/domain/assessment/cycle"),
    import("@/data/catalog/question-bank.json"),
  ]);
  const count = (table: string) => database.get(table).query().fetchCount();
  if ((await count("supplier_profile")) > 0) return;

  const general = CONSENT_TEXTS.texts.find((t) => t.kind === "general")!;
  const now = Date.now();

  await database.write(async () => {
    await database.get("consents").create((r) => {
      r._setRaw("consent_text_id", general.id);
      r._setRaw("kind", "general");
      r._setRaw("decision", "granted");
      r._setRaw("method", "checkbox");
      r._setRaw("text_version", general.version);
      r._setRaw("text_sha256", general.sha256);
      r._setRaw("device_at", now);
    });
    await database.get("supplier_profile").create((r) => {
      const raw: Record<string, string | number> = {
        person_type: "natural",
        tax_id: "900123456",
        tax_dv: "8",
        legal_name: DEMO_FARM.owner,
        department_code: "25",
        municipality_code: "25290",
        vereda: "El Placer",
        contact_channel: "whatsapp",
        main_category: "fruver",
        completed_at: now,
      };
      for (const [k, v] of Object.entries(raw)) r._setRaw(k, v);
    });
    const assessment = await database.get("assessments").create((r) => {
      r._setRaw("cycle_id", cycleFor(new Date()));
      r._setRaw("form_version", bank.version);
      r._setRaw("category", "fruver");
      r._setRaw("size", "micro");
      r._setRaw("status", "submitted");
      r._setRaw("current_index", Object.keys(DEMO_ANSWERS).length);
      r._setRaw("submitted_at", now);
    });
    for (const [questionId, answer] of Object.entries(DEMO_ANSWERS)) {
      await database.get("assessment_answers").create((r) => {
        r._setRaw("assessment_id", assessment.id);
        r._setRaw("question_id", questionId);
        r._setRaw("answer", Array.isArray(answer) ? JSON.stringify(answer) : answer);
        r._setRaw("answered_at", now);
      });
    }
    await database.get("declarations").create((r) => {
      r._setRaw("assessment_id", assessment.id);
      r._setRaw("text_version", DECLARATION.version);
      r._setRaw("signer_name", DEMO_FARM.owner);
      r._setRaw("method", "nombre");
      r._setRaw("device_at", now);
    });
  });
}
