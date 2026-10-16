import { describe, expect, it } from "vitest";
import { BACKOFF_MAX_MS, backoffDelay, nextBatch, priorityOf, statusLabel } from "./queue";

const change = (id: string, table: string, size = 100) => ({ id, table, size });

describe("cola de sync P1/P2/P3", () => {
  it("envía P1 antes que P2 y P3", () => {
    const batch = nextBatch([change("a", "assessments"), change("b", "erp_sales"), change("c", "evidences")]);
    expect(batch?.priority).toBe("P1");
    expect(batch?.changes.map((c) => c.id)).toEqual(["b"]);
  });

  it("solo pasa a P2 cuando P1 está vacío", () => {
    expect(nextBatch([change("a", "assessments"), change("c", "evidences")])?.priority).toBe("P2");
  });

  it("fracciona P1 en lotes de 10 KB", () => {
    const pending = Array.from({ length: 30 }, (_, i) => change(`s${i}`, "erp_sales", 1024));
    expect(nextBatch(pending)?.changes).toHaveLength(10);
  });

  it("incluye al menos un cambio aunque exceda el límite", () => {
    expect(nextBatch([change("big", "erp_sales", 50_000)])?.changes).toHaveLength(1);
  });

  it("devuelve null sin pendientes y falla con tablas desconocidas", () => {
    expect(nextBatch([])).toBeNull();
    expect(() => priorityOf("desconocida")).toThrow();
  });
});

describe("backoff exponencial", () => {
  it("crece de 1 s y se limita a 15 min", () => {
    expect(backoffDelay(0)).toBe(1_000);
    expect(backoffDelay(1)).toBe(2_000);
    expect(backoffDelay(5)).toBe(32_000);
    expect(backoffDelay(20)).toBe(BACKOFF_MAX_MS);
    expect(backoffDelay(20, 0.99)).toBe(BACKOFF_MAX_MS);
  });
});

describe("indicador de estado", () => {
  it("usa los textos de la guía", () => {
    expect(statusLabel({ kind: "offline" })).toBe("Sin conexión · guardado");
    expect(statusLabel({ kind: "pending", count: 3 })).toBe("3 pendientes");
  });
});
