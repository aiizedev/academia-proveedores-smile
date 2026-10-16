/* Cola de sincronización priorizada (RF-SYN-003, RF-SYN-006, RF-SYN-007).
   P1 → P2 → P3 en orden estricto: un nivel no se envía mientras el superior
   tenga pendientes. Funciones puras para poder probarlas sin navegador. */

export type Priority = "P1" | "P2" | "P3";
export const PRIORITY_ORDER: readonly Priority[] = ["P1", "P2", "P3"];

/** Tabla local → prioridad (arquitectura.md §5). */
export const TABLE_PRIORITY: Readonly<Record<string, Priority>> = {
  erp_sales: "P1",
  erp_costs: "P1",
  erp_stock_entries: "P1",
  erp_waste: "P1",
  trz_applications: "P1",
  trz_lots: "P1",
  assessments: "P2",
  assessment_answers: "P2",
  declarations: "P2",
  consents: "P2",
  supplier_profile: "P2",
  goal_checks: "P2",
  evidences: "P3",
};

/** Tamaño máximo del lote comprimido por prioridad, en bytes. */
export const BATCH_LIMIT_BYTES: Readonly<Record<Priority, number>> = {
  P1: 10 * 1024,
  P2: 50 * 1024,
  P3: 4 * 1024 * 1024,
};

export interface PendingChange {
  id: string;
  table: string;
  /** Tamaño estimado serializado (bytes) para fraccionar lotes. */
  size: number;
}

export function priorityOf(table: string): Priority {
  const p = TABLE_PRIORITY[table];
  if (!p) throw new Error(`Tabla sin prioridad de sync: ${table}`);
  return p;
}

/**
 * Siguiente lote a enviar: toma la prioridad más alta con pendientes y llena
 * hasta el límite de bytes (siempre al menos un cambio, aunque lo exceda).
 * Devuelve null si no hay nada pendiente.
 */
export function nextBatch(pending: readonly PendingChange[]): { priority: Priority; changes: PendingChange[] } | null {
  for (const priority of PRIORITY_ORDER) {
    const candidates = pending.filter((c) => priorityOf(c.table) === priority);
    if (candidates.length === 0) continue;
    const limit = BATCH_LIMIT_BYTES[priority];
    const changes: PendingChange[] = [];
    let total = 0;
    for (const c of candidates) {
      if (changes.length > 0 && total + c.size > limit) break;
      changes.push(c);
      total += c.size;
    }
    return { priority, changes };
  }
  return null;
}

export const BACKOFF_MIN_MS = 1_000;
export const BACKOFF_MAX_MS = 15 * 60 * 1_000;

/** Backoff exponencial 1 s → 15 min (RF-SYN-006). `attempt` empieza en 0. `jitter` ∈ [0,1). */
export function backoffDelay(attempt: number, jitter = 0): number {
  const base = Math.min(BACKOFF_MAX_MS, BACKOFF_MIN_MS * 2 ** Math.max(0, attempt));
  return Math.min(BACKOFF_MAX_MS, Math.round(base * (1 + jitter * 0.2)));
}

export type SyncStatus =
  | { kind: "saved" }
  | { kind: "offline" }
  | { kind: "syncing"; priority: Priority }
  | { kind: "pending"; count: number }
  | { kind: "retrying"; inMs: number };

/** Texto visible del indicador (RF-SYN-006, tono SPEC-SOT D2 §3). */
export function statusLabel(status: SyncStatus): string {
  switch (status.kind) {
    case "saved":
      return "Guardado";
    case "offline":
      return "Sin conexión · guardado";
    case "syncing":
      return "Sincronizando";
    case "pending":
      return status.count === 1 ? "1 pendiente" : `${status.count} pendientes`;
    case "retrying":
      return "Reintentando";
  }
}
