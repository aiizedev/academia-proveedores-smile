import { describe, expect, it } from "vitest";
import { formatCOP, formatDate, formatNumber } from "./format";

describe("formato es-CO", () => {
  it("formatea COP enteros con punto de miles", () => {
    expect(formatCOP(1234567)).toBe("$ 1.234.567");
    expect(formatCOP(0)).toBe("$ 0");
    expect(formatCOP(999)).toBe("$ 999");
    expect(formatCOP(-45000)).toBe("-$ 45.000");
  });

  it("rechaza montos con decimales", () => {
    expect(() => formatCOP(10.5)).toThrow(RangeError);
  });

  it("usa coma decimal", () => {
    expect(formatNumber(1234.5, 1)).toBe("1.234,5");
    expect(formatNumber(12.345, 2)).toBe("12,35");
  });

  it("fecha dd/mm/aaaa en hora de Bogotá", () => {
    // 2026-01-01T03:00Z es aún 31/12/2025 en Bogotá (UTC-5).
    expect(formatDate("2026-01-01T03:00:00Z")).toBe("31/12/2025");
    expect(formatDate(new Date("2026-10-15T15:00:00Z"))).toBe("15/10/2026");
  });
});
