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

/* ---------- Datos fijos de las pantallas de demo (sin WatermelonDB) ---------- */

export type Unit = "kg" | "bulto" | "arroba" | "canastilla";

export interface SaleRow { id: string; date: string; product: string; quantity: number; unit: Unit; amountCop: number; customer: string }
export interface CostRow { id: string; date: string; category: string; detail: string; amountCop: number }
export interface WasteRow { id: string; date: string; product: string; kg: number; cause: string }
export interface StockRow { id: string; product: string; kg: number; updated: string }

export const PRODUCTS = ["Tomate chonto", "Mora de Castilla", "Lulo", "Habichuela", "Arveja verde", "Cilantro"] as const;
export const COST_CATEGORIES = ["Insumos", "Mano de obra", "Transporte", "Empaques"] as const;
export const WASTE_CAUSES = ["Daño en cosecha", "Plaga o enfermedad", "Maduración", "Transporte"] as const;

export const SALES: SaleRow[] = [
  { id: "v1", date: "2026-10-15", product: "Tomate chonto", quantity: 320, unit: "kg", amountCop: 1_088_000, customer: "Grupo Smile" },
  { id: "v2", date: "2026-10-13", product: "Mora de Castilla", quantity: 85, unit: "kg", amountCop: 552_500, customer: "Grupo Smile" },
  { id: "v3", date: "2026-10-10", product: "Lulo", quantity: 60, unit: "kg", amountCop: 300_000, customer: "Plaza de Fusagasugá" },
  { id: "v4", date: "2026-10-08", product: "Tomate chonto", quantity: 280, unit: "kg", amountCop: 952_000, customer: "Grupo Smile" },
  { id: "v5", date: "2026-10-03", product: "Habichuela", quantity: 120, unit: "kg", amountCop: 360_000, customer: "Grupo Smile" },
];
export const COSTS: CostRow[] = [
  { id: "c1", date: "2026-10-14", category: "Insumos", detail: "Abono orgánico, 10 bultos", amountCop: 420_000 },
  { id: "c2", date: "2026-10-12", category: "Mano de obra", detail: "Jornales de cosecha (6)", amountCop: 390_000 },
  { id: "c3", date: "2026-10-09", category: "Transporte", detail: "Flete al centro de acopio", amountCop: 180_000 },
  { id: "c4", date: "2026-10-05", category: "Empaques", detail: "Canastillas plásticas", amountCop: 240_000 },
];
export const WASTE: WasteRow[] = [
  { id: "m1", date: "2026-10-15", product: "Tomate chonto", kg: 18, cause: "Maduración" },
  { id: "m2", date: "2026-10-11", product: "Mora de Castilla", kg: 6, cause: "Daño en cosecha" },
  { id: "m3", date: "2026-10-07", product: "Lulo", kg: 4, cause: "Transporte" },
];
export const STOCK: StockRow[] = [
  { id: "i1", product: "Tomate chonto", kg: 410, updated: "2026-10-15" },
  { id: "i2", product: "Mora de Castilla", kg: 95, updated: "2026-10-13" },
  { id: "i3", product: "Lulo", kg: 70, updated: "2026-10-10" },
  { id: "i4", product: "Habichuela", kg: 140, updated: "2026-10-03" },
];

export const KPIS = { monthLabel: "Octubre 2026", salesCop: 3_252_500, costsCop: 1_230_000, inventoryKg: 715, wastePct: 4.1 };

export interface Lot { code: string; product: string; plot: string; harvestedOn: string; lastApplication: { product: string; date: string; withholdingDays: number }; safeOn: string; status: "bloqueado" | "liberado"; label?: { code: string; qrText: string } }
export const LOTS: Lot[] = [
  {
    code: "L-2026-031",
    product: "Tomate chonto",
    plot: "Lote 3 · invernadero",
    harvestedOn: "",
    lastApplication: { product: "Mancozeb 80 WP", date: "2026-10-09", withholdingDays: 11 },
    safeOn: "2026-10-20",
    status: "bloqueado",
  },
  {
    code: "L-2026-028",
    product: "Mora de Castilla",
    plot: "Lote 1 · ladera",
    harvestedOn: "2026-10-13",
    lastApplication: { product: "Extracto de ajo (biológico)", date: "2026-09-25", withholdingDays: 3 },
    safeOn: "2026-09-28",
    status: "liberado",
    label: { code: "SML-25290-2026-028", qrText: "SML-25290-2026-028|Mora de Castilla|Finca La Esperanza|Cosecha 13/10/2026|Carencia cumplida" },
  },
];

export const SCORE = {
  total: 71,
  stage: { code: "E3", name: "Plan de mejora en curso" },
  pillars: [
    { name: "Sostenibilidad (autoevaluación)", weight: 50, score: 67, why: "Su diagnóstico ESG del ciclo 2026-C3." },
    { name: "Desempeño en recepción", weight: 30, score: 82, why: "Calidad y cumplimiento de sus entregas en Smile." },
    { name: "Plan y evidencias", weight: 20, score: 60, why: "Metas en curso y evidencias cargadas." },
  ],
  boost: "Completar la meta de Residuos le sube hasta 6 puntos.",
};

export interface Reception { id: string; date: string; product: string; receivedKg: number; rejectedKg: number; cause: string | null; labelValid: boolean }
export const RECEPTIONS: Reception[] = [
  { id: "r1", date: "2026-10-15", product: "Tomate chonto", receivedKg: 320, rejectedKg: 9, cause: "Sobremaduración", labelValid: true },
  { id: "r2", date: "2026-10-13", product: "Mora de Castilla", receivedKg: 85, rejectedKg: 0, cause: null, labelValid: true },
  { id: "r3", date: "2026-10-08", product: "Tomate chonto", receivedKg: 280, rejectedKg: 22, cause: "Daño mecánico", labelValid: false },
];

export interface Message { id: string; from: string; date: string; subject: string; body: string; unread: boolean }
export const MESSAGES: Message[] = [
  { id: "n1", from: "Calidad · Grupo Smile", date: "2026-10-15", subject: "Recepción del 15/10", body: "Su tomate llegó con buen calibre. 9 kg con sobremaduración: coseche un día antes.", unread: true },
  { id: "n2", from: "Compras · Grupo Smile", date: "2026-10-12", subject: "Pedido de la semana", body: "Esta semana necesitamos 300 kg de tomate chonto y 80 kg de mora. ¿Puede cumplir?", unread: false },
  { id: "n3", from: "Academia Smile", date: "2026-10-01", subject: "¡Recibió una Flor!", body: "Por completar su autoevaluación a tiempo. Ya tiene 2 Flores este ciclo.", unread: false },
];

export interface Clip { id: string; title: string; goal: string; minutes: number; progress: number; offline: boolean }
export const CLIPS: Clip[] = [
  { id: "a1", title: "Separar residuos en tres canecas", goal: "Residuos", minutes: 3, progress: 100, offline: true },
  { id: "a2", title: "Triple lavado de envases paso a paso", goal: "Residuos", minutes: 4, progress: 40, offline: true },
  { id: "a3", title: "Su huella con los recibos del mes", goal: "Carbono", minutes: 5, progress: 0, offline: false },
];

export interface Benefit { id: string; title: string; condition: string; unlocked: boolean }
export const BENEFITS: Benefit[] = [
  { id: "b1", title: "Diagnóstico personalizado", condition: "Completó la autoevaluación", unlocked: true },
  { id: "b2", title: "Prioridad en compras", condition: "Complete 2 metas de su plan", unlocked: false },
  { id: "b3", title: "+4 % en el precio de compra", condition: "Etapa E5 con certificación BPA", unlocked: false },
  { id: "b4", title: "Beca de formación SENA", condition: "3 Flores en el año", unlocked: false },
];

export const RECOGNITIONS = { flowers: 2, faces: 1 };

/* ---------- Mi tablero (SPEC-DASH, dashboard del proveedor) ---------- */
export interface DashTile {
  id: "ventas" | "costos" | "margen" | "inventario";
  label: string;
  value: number;
  unit: "cop" | "pct" | "kg";
  delta: number;
  deltaUnit: string;
  deltaLabel: string;
  goodWhen: "up" | "down";
  trend: number[];
}

export const DASHBOARD: {
  monthLabel: string;
  tiles: DashTile[];
  bpaProximity: number;
  bpaMissing: string[];
  benefits: Array<{ id: string; label: string; value: number; hint: string }>;
  marginWeeks: string[];
  marginSeries: number[];
  marginGoal: number;
  alerts: { cutDays: number; cutLot: string; cutProduct: string; newBadges: number; badgeName: string; flowers: number; flowersGoal: number };
} = {
  monthLabel: "Octubre 2026",
  tiles: [
    { id: "ventas", label: "Ventas del mes", value: 3_252_500, unit: "cop", delta: 12.4, deltaUnit: " %", deltaLabel: "vs. septiembre", goodWhen: "up", trend: [2.1, 2.4, 2.2, 2.7, 2.9, 3.25] },
    { id: "costos", label: "Costos del mes", value: 1_230_000, unit: "cop", delta: -6.1, deltaUnit: " %", deltaLabel: "vs. septiembre", goodWhen: "down", trend: [1.42, 1.38, 1.4, 1.33, 1.31, 1.23] },
    { id: "margen", label: "Margen neto", value: 62.2, unit: "pct", delta: 4.8, deltaUnit: " pts", deltaLabel: "vs. septiembre", goodWhen: "up", trend: [48, 51, 50, 55, 58, 62.2] },
    { id: "inventario", label: "Inventario", value: 715, unit: "kg", delta: -40, deltaUnit: " kg", deltaLabel: "esta semana", goodWhen: "up", trend: [690, 760, 820, 740, 755, 715] },
  ],
  bpaProximity: 72,
  bpaMissing: ["Registro de aplicaciones al día", "Bodega de agroquímicos con llave", "Análisis de agua del último año"],
  benefits: [
    { id: "agro", label: "Agroquímicos", value: 186_000, hint: "Ahorro: dosis según etiqueta y monitoreo de plagas" },
    { id: "mermas", label: "Mermas", value: 142_500, hint: "Evitadas: cosecha un día antes y canastillas limpias" },
    { id: "bono", label: "Bono +4 %", value: 130_100, hint: "Bonificación: mejor precio de compra al llegar a E5 con BPA" },
  ],
  marginWeeks: ["S36", "S37", "S38", "S39", "S40", "S41", "S42"],
  marginSeries: [47, 52, 50, 56, 58, 61, 62],
  marginGoal: 60,
  alerts: { cutDays: 4, cutLot: "L-2026-031", cutProduct: "Tomate chonto", newBadges: 1, badgeName: "Separadora de residuos", flowers: 2, flowersGoal: 3 },
};
