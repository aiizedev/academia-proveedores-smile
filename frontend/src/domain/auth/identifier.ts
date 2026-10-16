/* Identificador de ingreso (RF-IAM-002, CU-02): celular colombiano de 10
   dígitos o correo. Se normaliza antes de enviarlo para que "300 123 4567" y
   "+57 3001234567" ingresen igual. */

export type Identifier = { kind: "phone"; value: string } | { kind: "email"; value: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseIdentifier(input: string): Identifier | null {
  const trimmed = input.trim();
  if (trimmed.includes("@")) {
    const email = trimmed.toLowerCase();
    return EMAIL.test(email) ? { kind: "email", value: email } : null;
  }
  let digits = trimmed.replace(/[\s().-]/g, "");
  if (digits.startsWith("+57")) digits = digits.slice(3);
  else if (digits.startsWith("57") && digits.length === 12) digits = digits.slice(2);
  return /^3\d{9}$/.test(digits) ? { kind: "phone", value: digits } : null;
}

export type Role = "PROVEEDOR" | "REVIEWER" | "ADMIN";

/** Destino tras ingresar (HU-IAM-02): el proveedor a la PWA, el equipo Smile al back-office. */
export function homeFor(role: Role, next?: string | null): string {
  const area = role === "PROVEEDOR" ? "/app" : "/smile";
  // Solo se respeta `next` si es una ruta interna de su propia área.
  return next && next.startsWith(area) && !next.startsWith("//") ? next : area;
}
