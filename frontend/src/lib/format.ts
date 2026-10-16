/* Formato es-CO (RNF-I18N-001, RF-CAL-005): COP entero `$ 1.234.567`,
   fechas dd/mm/aaaa, decimales con coma, zona America/Bogota. */

export const TIME_ZONE = "America/Bogota";

const thousands = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Formatea pesos colombianos enteros. Lanza si recibe decimales: los montos son BIGINT (RNF-DATA-001). */
export function formatCOP(amount: number): string {
  if (!Number.isInteger(amount)) throw new RangeError(`COP debe ser entero, recibido ${amount}`);
  const sign = amount < 0 ? "-" : "";
  return `${sign}$ ${thousands(Math.abs(amount).toString())}`;
}

/** Número con coma decimal y punto de miles. */
export function formatNumber(value: number, decimals = 0): string {
  const fixed = Math.abs(value).toFixed(decimals);
  const [int = "0", frac] = fixed.split(".");
  const sign = value < 0 ? "-" : "";
  return `${sign}${thousands(int)}${frac ? `,${frac}` : ""}`;
}

/** Fecha de negocio en dd/mm/aaaa según la hora de Bogotá. */
export function formatDate(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")}`;
}
