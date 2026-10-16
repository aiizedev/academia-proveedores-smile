/* Datos simulados del back-office /smile para la demo navegable (sin API).
   La base (nombres, fincas, NIT, municipios, segmento) es la del seed del backend
   (MODO_POC §3.2: proveedor@ + proveedor01…30, 5 ESTRATÉGICO). Las métricas se
   derivan con un generador determinista: la demo muestra lo mismo en cada carga. */

export type Stage = "E1" | "E2" | "E3" | "E4" | "E5" | "E6";
export type Segment = "ESTRATEGICO" | "LOCAL";
export type AxisCode = "bpa" | "residuos" | "carbono" | "infantil" | "ddhh";
export type GoalPriority = "urgente" | "alta" | "media" | "mantener";

export const STAGES: ReadonlyArray<{ code: Stage; name: string; hint: string }> = [
  { code: "E1", name: "Ingreso y registro", hint: "Ficha obligatoria completa" },
  { code: "E2", name: "Diagnóstico completado", hint: "Autoevaluación del cuatrimestre enviada" },
  { code: "E3", name: "Plan de mejora", hint: "Plan con 3 metas prioritarias" },
  { code: "E4", name: "Adopción y formación", hint: "Registra en el Mini ERP y ve los clips" },
  { code: "E5", name: "Candidato a certificación", hint: "Score ≥ 80 % o BPA ICA" },
  { code: "E6", name: "Sostenible preferente", hint: "Prioridad de compra e incentivo +4 %" },
];

export const AXES: ReadonlyArray<{ code: AxisCode; name: string }> = [
  { code: "bpa", name: "Buenas prácticas e inocuidad" },
  { code: "residuos", name: "Manejo de residuos" },
  { code: "carbono", name: "Huella de carbono" },
  { code: "infantil", name: "Trabajo infantil" },
  { code: "ddhh", name: "Derechos humanos y SST" },
];

/** Merma recibida por Smile: base histórica 22 % y meta 8 % (SPEC-DASH, Dashboard Smile). */
export const WASTE_BASELINE = 22;
export const WASTE_TARGET = 8;

// key, representante, celular, finca, persona, NIT-DV, departamento, municipio, segmento, canal
const SEED: ReadonlyArray<readonly [string, string, string, string, string, string, string, string, Segment, string]> = [
  ["proveedor", "María Fernanda Rojas", "3001234567", "Finca La Esperanza", "natural", "1069712345-3", "Cundinamarca", "Fusagasugá", "LOCAL", "whatsapp"],
  ["proveedor01", "José Pérez Ávila", "3100000001", "Granja Monteverde", "natural", "1037838651-8", "Boyacá", "Tunja", "ESTRATEGICO", "correo"],
  ["proveedor02", "José Martínez Pérez", "3100000002", "Granja La Primavera", "natural", "1097561163-2", "Cundinamarca", "Silvania", "ESTRATEGICO", "correo"],
  ["proveedor03", "Óscar Pinzón Gómez", "3100000003", "Huerta El Paraíso", "natural", "1042323050-9", "Boyacá", "Duitama", "ESTRATEGICO", "correo"],
  ["proveedor04", "Pedro Vargas Pinzón", "3100000004", "Hacienda La Cabaña", "natural", "1017294706-5", "Cundinamarca", "Silvania", "ESTRATEGICO", "whatsapp"],
  ["proveedor05", "Hernán Rojas Martínez", "3100000005", "Granja Buenavista S.A.S.", "juridica", "900100005-0", "Cundinamarca", "Villeta", "ESTRATEGICO", "llamada"],
  ["proveedor06", "Blanca Castro Castro", "3100000006", "Granja Santa Rosa", "natural", "1029951428-5", "Cundinamarca", "Silvania", "LOCAL", "correo"],
  ["proveedor07", "José Pinzón Pérez", "3100000007", "Huerta El Retiro", "natural", "1075057709-2", "Cundinamarca", "Zipaquirá", "LOCAL", "llamada"],
  ["proveedor08", "Pedro Vargas Suárez", "3100000008", "Finca La Cabaña S.A.S.", "juridica", "900100008-2", "Cundinamarca", "Zipaquirá", "LOCAL", "llamada"],
  ["proveedor09", "Ana Lucía Gómez Moreno", "3100000009", "Granja Buenavista S.A.S.", "juridica", "900100009-1", "Boyacá", "Tunja", "LOCAL", "whatsapp"],
  ["proveedor10", "Jorge Torres Ramírez", "3100000010", "Granja El Paraíso", "natural", "1071649197-8", "Boyacá", "Ventaquemada", "LOCAL", "whatsapp"],
  ["proveedor11", "Martha Pérez Cárdenas", "3100000011", "Hacienda Las Brisas S.A.S.", "juridica", "900100011-5", "Cundinamarca", "Fusagasugá", "LOCAL", "whatsapp"],
  ["proveedor12", "Óscar Pinzón Castro", "3100000012", "Hacienda Las Brisas S.A.S.", "juridica", "900100012-2", "Cundinamarca", "Fusagasugá", "LOCAL", "llamada"],
  ["proveedor13", "Rosa Cárdenas Ávila", "3100000013", "Hacienda Los Naranjos", "natural", "1073082062-4", "Boyacá", "Paipa", "LOCAL", "whatsapp"],
  ["proveedor14", "Luis Pérez Vargas", "3100000014", "Hacienda El Paraíso", "natural", "1026446179-1", "Cundinamarca", "Villeta", "LOCAL", "correo"],
  ["proveedor15", "Hernán Gómez Martínez", "3100000015", "Vereda La Cabaña", "natural", "1090761928-2", "Cundinamarca", "Fusagasugá", "LOCAL", "llamada"],
  ["proveedor16", "Rosa Rodríguez Ávila", "3100000016", "Granja La Primavera", "natural", "1013404718-2", "Boyacá", "Duitama", "LOCAL", "whatsapp"],
  ["proveedor17", "Pedro Castro Ramírez", "3100000017", "Granja Las Brisas S.A.S.", "juridica", "900100017-9", "Cundinamarca", "Pacho", "LOCAL", "whatsapp"],
  ["proveedor18", "Gloria Torres Pérez", "3100000018", "Hacienda El Paraíso", "natural", "1014575576-1", "Cundinamarca", "Fómeque", "LOCAL", "correo"],
  ["proveedor19", "Diana Castro Chaparro", "3100000019", "Vereda La Primavera", "natural", "1021781472-0", "Cundinamarca", "Silvania", "LOCAL", "whatsapp"],
  ["proveedor20", "Pedro Rojas Martínez", "3100000020", "Finca El Mirador", "natural", "1093928844-2", "Cundinamarca", "Villeta", "LOCAL", "llamada"],
  ["proveedor21", "Ana Lucía Rojas Moreno", "3100000021", "Huerta Las Brisas", "natural", "1040197577-1", "Boyacá", "Ventaquemada", "LOCAL", "correo"],
  ["proveedor22", "Rosa Gómez Ávila", "3100000022", "Huerta El Retiro", "natural", "1057309548-0", "Cundinamarca", "Silvania", "LOCAL", "whatsapp"],
  ["proveedor23", "Carlos Beltrán Cárdenas", "3100000023", "Hacienda Los Naranjos", "natural", "1030623430-8", "Cundinamarca", "Silvania", "LOCAL", "correo"],
  ["proveedor24", "Jorge Ávila Ramírez", "3100000024", "Huerta El Paraíso S.A.S.", "juridica", "900100024-0", "Boyacá", "Samacá", "LOCAL", "llamada"],
  ["proveedor25", "Hernán Martínez Cárdenas", "3100000025", "Hacienda Santa Rosa", "natural", "1096326318-7", "Cundinamarca", "Silvania", "LOCAL", "whatsapp"],
  ["proveedor26", "María Gómez Gómez", "3100000026", "Vereda El Recreo S.A.S.", "juridica", "900100026-5", "Cundinamarca", "La Mesa", "LOCAL", "whatsapp"],
  ["proveedor27", "Luz Marina Torres Gómez", "3100000027", "Finca El Retiro", "natural", "1028932681-8", "Cundinamarca", "Fómeque", "LOCAL", "whatsapp"],
  ["proveedor28", "Pedro Rojas Chaparro", "3100000028", "Finca La Cabaña", "natural", "1064900571-1", "Cundinamarca", "Fómeque", "LOCAL", "correo"],
  ["proveedor29", "Óscar Vargas Castro", "3100000029", "Huerta San José", "natural", "1055650108-6", "Boyacá", "Duitama", "LOCAL", "llamada"],
  ["proveedor30", "José Ramírez Rodríguez", "3100000030", "Vereda Las Brisas", "natural", "1091491228-1", "Cundinamarca", "Silvania", "LOCAL", "llamada"],
];

/** Etapa por proveedor: todas las etapas tienen proveedores y el funnel se ve escalonado. */
const STAGE_PLAN: readonly Stage[] = [
  "E4", "E6", "E5", "E6", "E5", "E4", "E1", "E2", "E3", "E4", "E3", "E2", "E1", "E3", "E4", "E2",
  "E3", "E5", "E1", "E4", "E2", "E3", "E1", "E4", "E2", "E3", "E1", "E2", "E4", "E3", "E2",
];

export interface Goal {
  axis: AxisCode;
  priority: GoalPriority;
  step: string;
  done: boolean;
}

export interface Supplier {
  id: string;
  rep: string;
  phone: string;
  email: string;
  farm: string;
  personType: "natural" | "juridica";
  nit: string;
  department: string;
  municipality: string;
  segment: Segment;
  channel: string;
  category: "Fruver";
  size: "Micro" | "Pequeña" | "Mediana";
  stage: Stage;
  pillars: { p1: number; p2: number; p3: number };
  score: number;
  axes: Record<AxisCode, number>;
  wastePct: number;
  childLaborFree: boolean;
  bpaIca: boolean;
  plan: Goal[];
  documents: Array<{ name: string; status: "Verificado" | "Pendiente" | "Vencido"; expires: string }>;
  visits: Array<{ date: string; kind: string; ally: string; note: string }>;
  recognitions: { flowers: number; smiles: number; badges: string[] };
  messages: Array<{ from: "Smile" | "Proveedor"; date: string; text: string }>;
  finance: { salesCop: number; costsCop: number; marginPct: number; weeksWithRecords: number };
}

/** mulberry32: PRNG pequeño y determinista. */
function rng(seedText: string): () => number {
  let a = [...seedText].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0, 42);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (r: () => number, min: number, max: number) => Math.round(min + r() * (max - min));

const STEPS: Record<AxisCode, string> = {
  bpa: "Anote cada aplicación: producto, dosis, fecha y lote, y respete el periodo de carencia.",
  residuos: "Haga triple lavado de los envases y entréguelos al punto de Campo Limpio.",
  carbono: "Registre el combustible y los fertilizantes del mes para calcular su huella.",
  infantil: "Ponga por escrito que en la finca no trabajan menores de 15 años.",
  ddhh: "Afilie a sus trabajadores a seguridad social y entregue elementos de protección.",
};

/** La red parte de niveles distintos por eje: el carbono es el más rezagado, el trabajo infantil el más avanzado. */
const AXIS_BIAS: Record<AxisCode, number> = { bpa: 4, residuos: -6, carbono: -14, infantil: 16, ddhh: -2 };

const STAGE_SCORE: Record<Stage, [number, number]> = {
  E1: [28, 48],
  E2: [38, 58],
  E3: [45, 66],
  E4: [55, 78],
  E5: [80, 88],
  E6: [86, 95],
};

function build(row: (typeof SEED)[number], index: number): Supplier {
  const [key, rep, phone, farm, personType, nit, department, municipality, segment, channel] = row;
  const r = rng(key);
  const stage = STAGE_PLAN[index] ?? "E1";
  const [lo, hi] = STAGE_SCORE[stage];
  const score = between(r, lo, hi);
  const p1 = Math.min(100, score + between(r, -6, 6));
  const p2 = Math.min(100, score + between(r, -10, 8));
  const p3 = Math.max(0, Math.min(100, Math.round((score - 0.5 * p1 - 0.3 * p2) / 0.2)));
  const axes = Object.fromEntries(AXES.map((a) => [a.code, Math.min(100, Math.max(10, p1 + AXIS_BIAS[a.code] + between(r, -25, 20)))])) as Record<AxisCode, number>;
  const wastePct = Math.max(3, Math.min(20, Math.round((24 - score / 5 + r() * 4) * 10) / 10));
  const worst = [...AXES].sort((a, b) => axes[a.code] - axes[b.code]).slice(0, 3);
  const plan: Goal[] = worst.map((a, i) => ({
    axis: a.code,
    priority: axes[a.code] < 40 ? (i === 0 ? "urgente" : "alta") : axes[a.code] < 75 ? "media" : "mantener",
    step: STEPS[a.code],
    done: stage >= "E4" && i === 2,
  }));
  const salesCop = between(r, 18, 140) * 100_000;
  const costsCop = Math.round(salesCop * (0.55 + r() * 0.3));
  return {
    id: key,
    rep,
    phone,
    email: `${key}@smile.test`,
    farm,
    personType: personType as Supplier["personType"],
    nit,
    department,
    municipality,
    segment,
    channel,
    category: "Fruver",
    size: segment === "ESTRATEGICO" ? "Mediana" : r() < 0.7 ? "Micro" : "Pequeña",
    stage,
    pillars: { p1, p2, p3 },
    score,
    axes,
    wastePct,
    childLaborFree: stage >= "E3" || r() < 0.8,
    bpaIca: stage === "E6" || (stage === "E5" && r() < 0.5),
    plan,
    documents: [
      { name: "RUT", status: "Verificado", expires: "—" },
      { name: "Registro ICA del predio", status: stage >= "E3" ? "Verificado" : "Pendiente", expires: "2027-03-31" },
      { name: "Certificado BPA ICA", status: stage === "E6" ? "Verificado" : stage === "E5" ? "Pendiente" : "Vencido", expires: "2026-12-15" },
    ],
    visits:
      stage >= "E3"
        ? [
            { date: "2026-09-12", kind: "Seguimiento", ally: "SENA", note: "Revisión del cuaderno de aplicaciones y bodega de agroquímicos." },
            { date: "2026-07-03", kind: "Capacitación", ally: "Campo Limpio", note: "Triple lavado y entrega de envases." },
          ]
        : [],
    recognitions: {
      flowers: stage === "E6" ? 3 : stage === "E5" ? 1 : 0,
      smiles: between(r, 0, stage >= "E4" ? 6 : 2),
      badges: stage === "E6" ? ["Maestro BPA"] : [],
    },
    messages: [
      { from: "Smile", date: "2026-10-08", text: "Hola, ¿pudo revisar las metas de su plan de este cuatrimestre?" },
      ...(stage >= "E3" ? [{ from: "Proveedor" as const, date: "2026-10-09", text: "Sí, ya empecé con la primera meta. Gracias." }] : []),
    ],
    finance: {
      salesCop,
      costsCop,
      marginPct: Math.round(((salesCop - costsCop) / salesCop) * 1000) / 10,
      weeksWithRecords: stage >= "E4" ? between(r, 6, 12) : between(r, 0, 3),
    },
  };
}

export const SUPPLIERS: readonly Supplier[] = SEED.map(build);

export function supplierById(id: string): Supplier | undefined {
  return SUPPLIERS.find((s) => s.id === id);
}

export const MUNICIPALITIES = [...new Set(SUPPLIERS.map((s) => s.municipality))].sort();

export function stageCounts(list: readonly Supplier[] = SUPPLIERS): Record<Stage, number> {
  const counts = { E1: 0, E2: 0, E3: 0, E4: 0, E5: 0, E6: 0 };
  for (const s of list) counts[s.stage] += 1;
  return counts;
}

export function average(values: readonly number[]): number {
  return values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;
}

export interface Reception {
  id: string;
  date: string;
  supplierId: string;
  product: string;
  kg: number;
  rejectedKg: number;
  onTime: boolean;
  labelOk: boolean;
}

const PRODUCTS = ["Tomate chonto", "Mora de Castilla", "Lulo", "Papa criolla", "Cebolla cabezona", "Uchuva", "Aguacate Hass", "Zanahoria"];

export const RECEPTIONS: readonly Reception[] = SUPPLIERS.flatMap((s, i) => {
  const r = rng(`rec-${s.id}`);
  return [0, 1].map((k) => {
    const kg = between(r, 80, 900);
    return {
      id: `REC-${String(i * 2 + k + 1).padStart(3, "0")}`,
      date: `2026-10-${String(14 - k * 7 - (i % 5)).padStart(2, "0")}`,
      supplierId: s.id,
      product: PRODUCTS[(i + k) % PRODUCTS.length] ?? "Tomate chonto",
      kg,
      rejectedKg: Math.round((kg * s.wastePct) / 100),
      onTime: r() < 0.82,
      labelOk: r() < 0.9,
    };
  });
}).sort((a, b) => b.date.localeCompare(a.date));

export function formatCop(value: number): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export const STAGE_LABEL: Record<Stage, string> = Object.fromEntries(STAGES.map((s) => [s.code, `${s.code} · ${s.name}`])) as Record<Stage, string>;

/* Banco de preguntas publicado (contracts/fixtures/question-bank.json, copia del frontend).
   Se re-exporta aquí porque /smile no puede importar src/data/catalog (límites de ESLint). */
export { default as QUESTION_BANK } from "@/data/catalog/question-bank.json";

/* =====================================================================
   Series para los dashboards (ciclos, volumen, gasto, mermas por causa,
   huella). Deterministas y coherentes con la ficha de arriba: el ciclo
   C3-2026 (en curso) es la foto actual de cada proveedor.
   ===================================================================== */

export type CycleId = "C1-2026" | "C2-2026" | "C3-2026";
export type AnyCycle = CycleId | "C3-2025";
export const CYCLES: ReadonlyArray<{ id: CycleId; label: string; short: string; months: readonly number[]; prev: AnyCycle }> = [
  { id: "C1-2026", label: "C1 · ene–abr 2026", short: "C1", months: [0, 1, 2, 3], prev: "C3-2025" },
  { id: "C2-2026", label: "C2 · may–ago 2026", short: "C2", months: [4, 5, 6, 7], prev: "C1-2026" },
  { id: "C3-2026", label: "C3 · sep–dic 2026", short: "C3", months: [8, 9], prev: "C2-2026" },
];
export const CURRENT_CYCLE: CycleId = "C3-2026";
/** Meses con datos: enero a octubre de 2026 (hoy, 16 de octubre). */
export const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct"] as const;

/** Sectores del banco v4 (question-bank.json → categories). La red piloto es Fruver. */
export const CATEGORIES: ReadonlyArray<{ code: string; label: string }> = [
  { code: "Fruver", label: "Fruver" },
  { code: "Lácteos", label: "Lácteos" },
  { code: "Cárnicos", label: "Cárnicos" },
  { code: "Pescados", label: "Pescados y mariscos" },
  { code: "Insumos", label: "Insumos y servicios" },
];

/** Causas de merma (C-06, gana SOT §2.2). */
export const WASTE_CAUSES = [
  { code: "plagas", label: "Plagas o enfermedades" },
  { code: "mecanico", label: "Daño mecánico postcosecha" },
  { code: "descomposicion", label: "Descomposición natural" },
  { code: "empaque", label: "Defecto de empaque" },
] as const;
export type WasteCause = (typeof WASTE_CAUSES)[number]["code"];

export interface CycleSnapshot {
  stage: Stage;
  score: number;
  wastePct: number;
  /** % de lotes recibidos con período de carencia verificado (rótulo válido). */
  carenciaPct: number;
  /** kg CO₂e por tonelada producida. */
  footprint: number;
  childLaborFree: boolean;
}

export interface SupplierSeries {
  id: string;
  /** Primer ciclo con la Academia (antes no aparece en los tableros). */
  joined: AnyCycle;
  /** Volumen comprado por Smile, kg/mes (dato de Smile, no del ERP del proveedor). */
  volumeKg: number;
  /** Precio medio pagado por Smile, COP/kg. */
  priceCop: number;
  /** Reparto de la merma por causa (suma 1). */
  causes: Record<WasteCause, number>;
  cycles: Record<AnyCycle, CycleSnapshot | null>;
  /** Merma mensual (ene–oct) en %, null si aún no era proveedor de la Academia. */
  monthlyWaste: Array<number | null>;
  monthlyFootprint: Array<number | null>;
}

export const STAGE_ORDER: readonly Stage[] = ["E1", "E2", "E3", "E4", "E5", "E6"];
export const CYCLE_ORDER: readonly AnyCycle[] = ["C3-2025", "C1-2026", "C2-2026", "C3-2026"];
const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function buildSeries(s: Supplier): SupplierSeries {
  const r = rng(`series-${s.id}`);
  const idx = STAGE_ORDER.indexOf(s.stage);
  // Los E1 llegaron este ciclo; algunos E2 en C2; el resto venía desde antes.
  const joinedAt = s.stage === "E1" ? 3 : s.stage === "E2" && r() < 0.6 ? 2 : r() < 0.3 ? 1 : 0;
  const strategic = s.segment === "ESTRATEGICO";
  // Pareto: los estratégicos concentran la mayor parte del volumen comprado.
  const volumeKg = strategic ? between(r, 9000, 16000) : between(r, 280, 2400);
  const raw = [0.15 + r() * 0.2, 0.25 + r() * 0.25, 0.2 + r() * 0.2, 0.08 + r() * 0.15];
  const sum = raw.reduce((a, b) => a + b, 0);
  const causes = Object.fromEntries(WASTE_CAUSES.map((c, i) => [c.code, (raw[i] ?? 0) / sum])) as Record<WasteCause, number>;
  const baseFootprint = 200 - s.axes.carbono * 0.8;

  const cycles = {} as SupplierSeries["cycles"];
  CYCLE_ORDER.forEach((c, ci) => {
    if (ci < joinedAt) {
      cycles[c] = null;
      return;
    }
    const back = 3 - ci; // ciclos hacia atrás desde hoy
    const score = clamp(s.score - back * between(r, 3, 8), 18, 100);
    const drop = back > 0 && r() < 0.55 + back * 0.15 ? Math.min(back, 2) : 0;
    cycles[c] = {
      stage: STAGE_ORDER[clamp(idx - drop, 0, 5)] ?? "E1",
      score,
      wastePct: round1(clamp(s.wastePct + back * (1.2 + r() * 2.2), 3, 23)),
      carenciaPct: clamp(Math.round(48 + score * 0.52 - back * 6 + r() * 8), 30, 100),
      footprint: Math.round(baseFootprint + back * (6 + r() * 7)),
      childLaborFree: back === 0 ? s.childLaborFree : s.childLaborFree && (back < 2 || r() < 0.7),
    };
  });

  const monthCycle = (m: number): CycleId => (m < 4 ? "C1-2026" : m < 8 ? "C2-2026" : "C3-2026");
  const monthlyWaste = MONTHS.map((_, m) => {
    const c = cycles[monthCycle(m)];
    const drift = ((m % 4) - 1.5) * -0.5; // baja dentro del ciclo
    return c ? round1(clamp(c.wastePct + drift + (r() - 0.5) * 1.6, 2.5, 24)) : null;
  });
  const monthlyFootprint = MONTHS.map((_, m) => {
    const c = cycles[monthCycle(m)];
    return c ? Math.round(c.footprint + ((m % 4) - 1.5) * -1.5 + (r() - 0.5) * 6) : null;
  });

  return { id: s.id, joined: CYCLE_ORDER[joinedAt] ?? "C3-2025", volumeKg, priceCop: between(r, 2300, 3900), causes, cycles, monthlyWaste, monthlyFootprint };
}

export const SERIES: Readonly<Record<string, SupplierSeries>> = Object.fromEntries(SUPPLIERS.map((s) => [s.id, buildSeries(s)]));

/** Días promedio que un proveedor permanece en cada etapa (simulado, red piloto). */
export const STAGE_DAYS: Record<Stage, number> = { E1: 12, E2: 26, E3: 41, E4: 63, E5: 48, E6: 0 };
