/* NIT o cédula con dígito de verificación DIAN módulo 11 (RF-SUP-001, CU-04).
   Espejo de backend/.../suppliers/domain/nit.py; ambos se prueban con
   contracts/fixtures/nit-check-digit.json. */
const WEIGHTS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

export type NitError = "invalid_nit" | "nit_check_digit_mismatch";

export function normalizeNit(input: string): string {
  return input.replace(/[.\s-]/g, "");
}

export function checkDigit(number: string): string {
  const total = [...number].reverse().reduce((sum, d, i) => sum + Number(d) * (WEIGHTS[i] ?? 0), 0);
  const r = total % 11;
  return String(r < 2 ? r : 11 - r);
}

export function validateNit(number: string, dv: string): NitError | null {
  const digits = normalizeNit(number);
  if (!/^\d{5,15}$/.test(digits)) return "invalid_nit";
  return dv.trim() === checkDigit(digits) ? null : "nit_check_digit_mismatch";
}
