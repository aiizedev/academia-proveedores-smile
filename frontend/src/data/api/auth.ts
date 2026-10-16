import type { Session } from "@/lib/auth/session";
import { api } from "./client";

/* Ingreso contra POST /api/v1/auth/login (HU-IAM-02). Traduce cada respuesta
   a un resultado que la pantalla muestra sin jerga (guía de usabilidad §5). */
export type LoginError = "credentials" | "locked" | "rate_limited" | "offline" | "unexpected";

export type LoginResult = { ok: true; session: Session } | { ok: false; error: LoginError };

export async function login(identifier: string, password: string): Promise<LoginResult> {
  try {
    const { data, response } = await api.POST("/api/v1/auth/login", { body: { identifier, password } });
    if (data) {
      return {
        ok: true,
        session: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: Date.now() + data.expires_in * 1000,
          user: {
            id: data.user.id,
            fullName: data.user.full_name,
            role: data.user.role,
            phone: data.user.phone,
            email: data.user.email,
          },
        },
      };
    }
    const byStatus: Record<number, LoginError> = { 400: "credentials", 401: "credentials", 422: "credentials", 423: "locked", 429: "rate_limited" };
    return { ok: false, error: byStatus[response.status] ?? "unexpected" };
  } catch {
    // fetch rechaza sin respuesta: sin red o API caída.
    return { ok: false, error: navigator.onLine ? "unexpected" : "offline" };
  }
}
