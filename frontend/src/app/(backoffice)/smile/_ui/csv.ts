/* Exportación CSV generada en el navegador (demo de "reportes 1 clic", SPEC-SOT §1.5). */
export type Cell = string | number | boolean;

export function toCsv(header: readonly string[], rows: ReadonlyArray<readonly Cell[]>): string {
  const esc = (v: Cell) => {
    const s = String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [header, ...rows].map((r) => r.map(esc).join(";")).join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  // BOM para que Excel en español abra tildes y ñ correctamente.
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
