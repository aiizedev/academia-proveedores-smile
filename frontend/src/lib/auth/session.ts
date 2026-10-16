import type { Role } from "@/domain/auth/identifier";

/* Sesión del dispositivo (RF-IAM-003). Permite abrir la PWA sin señal con la
   última sesión. POC: se guarda sin cifrar; el cifrado AES-GCM de ADR-0006
   está pospuesto (MODO_POC §1, R5). */
export interface Session {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms en que vence el access token. */
  expiresAt: number;
  user: { id: string; fullName: string; role: Role; phone: string | null; email: string | null };
}

const KEY = "smile.session.v1";

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  // POC: texto plano en localStorage; ADR-0006 pide refresh cifrado (AES-GCM) en IndexedDB.
  window.localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession(): void {
  window.localStorage.removeItem(KEY);
}
