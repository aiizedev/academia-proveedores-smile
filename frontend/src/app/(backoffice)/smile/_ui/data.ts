/* Selectores de los dashboards de /smile: toman los filtros globales y devuelven
   agregados (RF-PRV-007: nada de transacciones del ERP del proveedor; solo totales,
   promedios y porcentajes por ciclo). Todo es determinista a partir de src/mocks/smile. */
import {
  AXES,
  CYCLES,
  CYCLE_ORDER,
  MONTHS,
  QUESTION_BANK,
  RECEPTIONS,
  SERIES,
  STAGES,
  STAGE_ORDER,
  SUPPLIERS,
  WASTE_BASELINE,
  WASTE_CAUSES,
  type AnyCycle,
  type AxisCode,
  type CycleId,
  type CycleSnapshot,
  type Segment,
  type Stage,
  type Supplier,
  type SupplierSeries,
  type WasteCause,
} from "@/mocks/smile";

export type Filters = { cycle: CycleId; category: string; segment: Segment | ""; municipality: string };
export const DEFAULT_FILTERS: Filters = { cycle: "C3-2026", category: "", segment: "", municipality: "" };

export type Row = { s: Supplier; x: SupplierSeries; c: CycleSnapshot };

/* Matriz de riesgo: escala fija (no salta al filtrar), raíz cuadrada en Y; la mitad
   visual del eje es VOLUME_MAX / 4. */
export const VOLUME_MAX = 20_000;
export const VOLUME_MID = VOLUME_MAX / 4;
export const RISK_THRESHOLD = 60;
export const QUADRANTS = [
  { id: "atender", label: "Atender primero", hint: "Mucho volumen, score bajo" },
  { id: "aliados", label: "Aliados estratégicos", hint: "Mucho volumen, score alto" },
  { id: "acompanar", label: "Acompañar", hint: "Poco volumen, score bajo" },
  { id: "mantener", label: "Mantener", hint: "Poco volumen, score alto" },
] as const;
export type QuadrantId = (typeof QUADRANTS)[number]["id"];
export const quadrantOf = (score: number, kg: number): QuadrantId =>
  kg >= VOLUME_MID ? (score < RISK_THRESHOLD ? "atender" : "aliados") : score < RISK_THRESHOLD ? "acompanar" : "mantener";

const r1 = (n: number) => Math.round(n * 10) / 10;
const pctOf = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0);

export const cycleMeta = (id: CycleId) => CYCLES.find((c) => c.id === id) ?? CYCLES[CYCLES.length - 1]!;
export const prevCycle = (id: AnyCycle): AnyCycle | null => {
  const i = CYCLE_ORDER.indexOf(id);
  return i > 0 ? (CYCLE_ORDER[i - 1] ?? null) : null;
};
const monthsIn = (id: AnyCycle) => (id === "C3-2025" ? 4 : cycleMeta(id).months.length);

/** Proveedores que cumplen los filtros de dimensión (sin mirar el ciclo). */
export function matches(s: Supplier, f: Filters) {
  return (!f.category || s.category === f.category) && (!f.segment || s.segment === f.segment) && (!f.municipality || s.municipality === f.municipality);
}

/** Filas activas en un ciclo con su foto de ese ciclo. */
export function rowsAt(f: Filters, cycle: AnyCycle = f.cycle): Row[] {
  return SUPPLIERS.flatMap((s) => {
    const x = SERIES[s.id];
    const c = x?.cycles[cycle];
    return x && c && matches(s, f) ? [{ s, x, c }] : [];
  });
}

const weighted = (rows: Row[], pick: (r: Row) => number) => {
  const w = rows.reduce((a, r) => a + r.x.volumeKg, 0);
  return w > 0 ? r1(rows.reduce((a, r) => a + pick(r) * r.x.volumeKg, 0) / w) : 0;
};
const mean = (vals: number[]) => (vals.length ? r1(vals.reduce((a, b) => a + b, 0) / vals.length) : 0);

export type Kpis = { active: number; score: number; waste: number; carencia: number; childFree: number; footprint: number; strategic: number };
export function kpisAt(f: Filters, cycle: AnyCycle = f.cycle): Kpis {
  const rows = rowsAt(f, cycle);
  return {
    active: rows.length,
    score: mean(rows.map((r) => r.c.score)),
    waste: weighted(rows, (r) => r.c.wastePct),
    carencia: weighted(rows, (r) => r.c.carenciaPct),
    childFree: pctOf(rows.filter((r) => r.c.childLaborFree).length, rows.length),
    footprint: weighted(rows, (r) => r.c.footprint),
    strategic: rows.filter((r) => r.s.segment === "ESTRATEGICO").length,
  };
}

/** KPIs del ciclo, del anterior y la tendencia de los ciclos hasta el elegido. */
export function kpiPanel(f: Filters) {
  const now = kpisAt(f);
  const prevId = prevCycle(f.cycle);
  const prev = prevId ? kpisAt(f, prevId) : null;
  const upTo = CYCLE_ORDER.slice(0, CYCLE_ORDER.indexOf(f.cycle) + 1);
  const trend = upTo.map((c) => kpisAt(f, c));
  return { now, prev, prevLabel: prevId ? `vs ${prevId.slice(0, 2)}` : "", trend };
}

/** Merma mensual (ene–oct) ponderada por volumen, para el conjunto filtrado. */
export function monthlyWaste(f: Filters): Array<number | null> {
  const list = SUPPLIERS.filter((s) => matches(s, f));
  return MONTHS.map((_, m) => {
    let w = 0;
    let acc = 0;
    for (const s of list) {
      const x = SERIES[s.id];
      const v = x?.monthlyWaste[m];
      if (x && v !== null && v !== undefined) {
        w += x.volumeKg;
        acc += v * x.volumeKg;
      }
    }
    return w > 0 ? r1(acc / w) : null;
  });
}

export function monthlyFootprint(f: Filters): Array<number | null> {
  const list = SUPPLIERS.filter((s) => matches(s, f));
  return MONTHS.map((_, m) => {
    let w = 0;
    let acc = 0;
    for (const s of list) {
      const x = SERIES[s.id];
      const v = x?.monthlyFootprint[m];
      if (x && v !== null && v !== undefined) {
        w += x.volumeKg;
        acc += v * x.volumeKg;
      }
    }
    return w > 0 ? Math.round(acc / w) : null;
  });
}

export const cycleBand = (f: Filters) => {
  const m = cycleMeta(f.cycle).months;
  return { from: m[0] ?? 0, to: m[m.length - 1] ?? 0, label: cycleMeta(f.cycle).short };
};

/** Kilos rechazados por causa en el ciclo (C-06). */
export function wasteByCause(f: Filters) {
  const rows = rowsAt(f);
  const months = monthsIn(f.cycle);
  const kg = (code: WasteCause) => Math.round(rows.reduce((a, r) => a + r.x.volumeKg * months * (r.c.wastePct / 100) * r.x.causes[code], 0));
  return WASTE_CAUSES.map((c) => ({ id: c.code, label: c.label, kg: kg(c.code) }));
}

export function wasteByMunicipality(f: Filters) {
  const rows = rowsAt(f);
  const byMun = new Map<string, Row[]>();
  rows.forEach((r) => byMun.set(r.s.municipality, [...(byMun.get(r.s.municipality) ?? []), r]));
  return [...byMun.entries()]
    .map(([m, rs]) => ({ id: m, label: m, value: weighted(rs, (r) => r.c.wastePct), n: rs.length, dept: rs[0]?.s.department ?? "" }))
    .sort((a, b) => b.value - a.value);
}

/** Gasto de Smile por proveedor en el ciclo (COP) y su Pareto. */
export function pareto(f: Filters) {
  const rows = rowsAt(f);
  const months = monthsIn(f.cycle);
  const items = rows.map((r) => ({ id: r.s.id, label: r.s.farm, segment: r.s.segment, spend: r.x.volumeKg * r.x.priceCop * months })).sort((a, b) => b.spend - a.spend);
  const total = items.reduce((a, i) => a + i.spend, 0);
  let cum = 0;
  const withCum = items.map((i) => {
    cum += i.spend;
    return { ...i, share: pctOf(i.spend, total), cum: pctOf(cum, total) };
  });
  const strategicShare = pctOf(items.filter((i) => i.segment === "ESTRATEGICO").reduce((a, i) => a + i.spend, 0), total);
  const to80 = withCum.findIndex((i) => i.cum >= 80) + 1;
  return { items: withCum, total, strategicShare, to80 };
}

export function stageCountsAt(f: Filters, cycle: AnyCycle = f.cycle): Record<Stage, number> {
  const counts = { E1: 0, E2: 0, E3: 0, E4: 0, E5: 0, E6: 0 } as Record<Stage, number>;
  rowsAt(f, cycle).forEach((r) => (counts[r.c.stage] += 1));
  return counts;
}

export const funnelStages = (f: Filters) => {
  const c = stageCountsAt(f);
  return STAGES.map((st) => ({ id: st.code, short: st.code, label: st.name, count: c[st.code] }));
};

/** Proveedores que avanzaron de etapa respecto del ciclo anterior. */
export function advanced(f: Filters) {
  const p = prevCycle(f.cycle);
  if (!p) return 0;
  return rowsAt(f).filter((r) => {
    const before = r.x.cycles[p];
    return before && STAGE_ORDER.indexOf(r.c.stage) > STAGE_ORDER.indexOf(before.stage);
  }).length;
}

/* ---------- Marcos (mapeo del banco v4) ---------- */
type Q = { id: string; axis: string; weight: number; frameworks?: string[] };
const QUESTIONS: Q[] = (QUESTION_BANK.sections as ReadonlyArray<{ questions: Q[] }>).flatMap((s) => s.questions);

export const FRAMEWORKS = [
  { id: "iso", label: "ISO 14001", test: (f: string) => f.startsWith("ISO 14001") },
  { id: "bcorp", label: "B Corp", test: (f: string) => f.startsWith("B Corp") },
  { id: "gri", label: "GRI", test: (f: string) => f.startsWith("GRI") },
  { id: "ods", label: "ODS", test: (f: string) => f.startsWith("ODS") },
  { id: "tcfd", label: "TCFD / SASB", test: (f: string) => f === "TCFD" || f === "SASB" || f.startsWith("GHG") },
  { id: "co", label: "Normativa colombiana", test: (f: string) => /^(Res\.|Decreto|Ley|Resolución|ICA)/.test(f) },
] as const;

/** Puntaje del eje de un proveedor en el ciclo (proporcional a su score de ese ciclo). */
const axisAt = (r: Row, axis: AxisCode) => Math.max(0, Math.min(100, r.s.axes[axis] * (r.c.score / Math.max(1, r.s.score))));

export function frameworkCompliance(f: Filters) {
  const rows = rowsAt(f);
  return FRAMEWORKS.map((fw) => {
    const qs = QUESTIONS.filter((q) => (q.frameworks ?? []).some(fw.test));
    const w = qs.reduce((a, q) => a + q.weight, 0);
    const value = rows.length && w ? r1(mean(rows.map((r) => qs.reduce((a, q) => a + axisAt(r, q.axis as AxisCode) * q.weight, 0) / w))) : 0;
    return { id: fw.id, label: fw.label, value, questions: qs.length };
  });
}

/** Avance por ODS (meta numérica del mapeo, p. ej. "ODS 8.7" → ODS 8). */
const ODS_NAMES: Record<string, string> = {
  "2": "Hambre cero",
  "3": "Salud",
  "4": "Educación",
  "5": "Igualdad",
  "6": "Agua limpia",
  "7": "Energía",
  "8": "Empleo digno",
  "12": "Consumo resp.",
  "13": "Clima",
  "15": "Ecosistemas",
};
export function odsProgress(f: Filters) {
  const rows = rowsAt(f);
  return Object.entries(ODS_NAMES).map(([n, name]) => {
    const qs = QUESTIONS.filter((q) => (q.frameworks ?? []).some((fw) => fw === `ODS ${n}` || fw.startsWith(`ODS ${n}.`)));
    const w = qs.reduce((a, q) => a + q.weight, 0);
    const value = rows.length && w ? Math.round(mean(rows.map((r) => qs.reduce((a, q) => a + axisAt(r, q.axis as AxisCode) * q.weight, 0) / w))) : 0;
    return { id: `ods-${n}`, n, label: `ODS ${n} · ${name}`, value, questions: qs.length };
  }).filter((o) => o.questions > 0);
}

/** Municipio × eje (promedio del ciclo). */
export function axisHeat(f: Filters) {
  const rows = rowsAt(f);
  const muns = [...new Set(rows.map((r) => r.s.municipality))].sort();
  const cells = muns.flatMap((m) => {
    const rs = rows.filter((r) => r.s.municipality === m);
    return AXES.map((a) => ({ row: m, col: a.code, value: rs.length ? mean(rs.map((r) => axisAt(r, a.code))) : null, hint: `${rs.length} proveedor${rs.length === 1 ? "" : "es"}` }));
  });
  return { rows: muns, cells };
}

/* ---------- Impacto ---------- */
/** Huella de la red en la línea base (C3-2025) y meta −15 % el año 1 (DOC-FRUVER §4). */
export const FOOTPRINT_BASE = Math.round(kpisAt(DEFAULT_FILTERS, "C3-2025").footprint);
export const FOOTPRINT_GOAL = Math.round(FOOTPRINT_BASE * 0.85);

export function impact(f: Filters) {
  const rows = rowsAt(f);
  const months = monthsIn(f.cycle);
  const kgCycle = rows.reduce((a, r) => a + r.x.volumeKg * months, 0);
  const avoidedWasteKg = Math.round(rows.reduce((a, r) => a + r.x.volumeKg * months * Math.max(0, WASTE_BASELINE - r.c.wastePct) / 100, 0));
  const wasteSavings = Math.round(rows.reduce((a, r) => a + r.x.volumeKg * months * Math.max(0, WASTE_BASELINE - r.c.wastePct) / 100 * r.x.priceCop, 0));
  const fp = kpisAt(f).footprint;
  const base = kpisAt(f, "C3-2025").footprint || FOOTPRINT_BASE;
  const avoidedCo2 = Math.round(((kgCycle / 1000) * Math.max(0, base - fp)) / 1000 * 10) / 10; // t CO₂e
  const savings = [
    { id: "merma", label: "Merma evitada", value: wasteSavings },
    { id: "compost", label: "Compost", value: Math.round(wasteSavings * 0.21) },
    { id: "energia", label: "Energía", value: Math.round(wasteSavings * 0.13) },
    { id: "logistica", label: "Fletes evitados", value: Math.round(wasteSavings * 0.17) },
  ];
  return {
    kgCycle,
    avoidedWasteKg,
    avoidedCo2,
    savings,
    totalSavings: savings.reduce((a, s) => a + s.value, 0),
    formalJobs: rows.reduce((a, r) => a + (r.s.axes.ddhh >= 60 ? (r.s.size === "Mediana" ? 6 : 2) : 0), 0),
    schoolKids: rows.filter((r) => r.c.childLaborFree).length * 2 + 3,
    containersKg: Math.round(rows.reduce((a, r) => a + r.s.axes.residuos * 0.6, 0) * months / 4),
    trainingHours: rows.reduce((a, r) => a + (STAGE_ORDER.indexOf(r.c.stage) + 1) * 3, 0),
  };
}

/* ---------- Recepciones del conjunto filtrado ---------- */
export const receptionsFor = (f: Filters) => {
  const ids = new Set(rowsAt(f).map((r) => r.s.id));
  return RECEPTIONS.filter((r) => ids.has(r.supplierId));
};

export const fmtPct = (n: number) => `${n.toLocaleString("es-CO", { maximumFractionDigits: 1 })} %`;
export const fmtInt = (n: number) => Math.round(n).toLocaleString("es-CO");
export const fmtCopShort = (n: number) =>
  n >= 1_000_000_000 ? `$${(n / 1_000_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} mil M` : n >= 1_000_000 ? `$${(n / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} M` : `$${fmtInt(n)}`;
