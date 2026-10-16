import type { Database } from "@nozbe/watermelondb";
import { API_URL } from "@/lib/env";

/* Cliente del protocolo pull/push de WatermelonDB (RF-SYN-002, arquitectura.md §5).
   Esqueleto S0: la orquestación por prioridad (queue.ts) y el cifrado de campos
   (ADR-0006) se conectan en S1/S4 del plan frontend. */

export interface PushResponse {
  accepted: string[];
  rejected: Array<{ id: string; table: string; code: string; message: string }>;
}

async function gzipJson(body: unknown): Promise<Blob> {
  const stream = new Blob([JSON.stringify(body)]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Response(stream).blob();
}

export async function syncNow(database: Database, accessToken: string): Promise<void> {
  const { synchronize } = await import("@nozbe/watermelondb/sync");
  const auth = { Authorization: `Bearer ${accessToken}` };

  await synchronize({
    database,
    sendCreatedAsUpdated: false,
    pullChanges: async ({ lastPulledAt, schemaVersion }) => {
      const params = new URLSearchParams({
        last_pulled_at: String(lastPulledAt ?? 0),
        schema_version: String(schemaVersion),
      });
      const res = await fetch(`${API_URL}/api/v1/sync/pull?${params}`, { headers: auth });
      if (!res.ok) throw new Error(`pull ${res.status}`);
      return (await res.json()) as { changes: never; timestamp: number };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      const body = await gzipJson({
        mutation_id: crypto.randomUUID(),
        priority: "P2",
        last_pulled_at: lastPulledAt,
        changes,
      });
      const res = await fetch(`${API_URL}/api/v1/sync/push`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json", "Content-Encoding": "gzip" },
        body,
      });
      if (!res.ok) throw new Error(`push ${res.status}`);
      const result = (await res.json()) as PushResponse;
      const rejectedIds: Record<string, string[]> = {};
      for (const r of result.rejected) (rejectedIds[r.table] ??= []).push(r.id);
      return { experimentalRejectedIds: rejectedIds };
    },
  });
}
