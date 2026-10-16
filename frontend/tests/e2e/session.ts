import type { BrowserContext } from "@playwright/test";

/** Sesión de PROVEEDOR guardada en el dispositivo, como tras un ingreso real. */
export async function seedProveedorSession(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    window.localStorage.setItem(
      "smile.session.v1",
      JSON.stringify({
        accessToken: "e2e",
        refreshToken: "e2e-refresh-token",
        expiresAt: Date.now() + 15 * 60_000,
        user: { id: "00000000-0000-4000-8000-000000000001", fullName: "Finca La Esperanza", role: "PROVEEDOR", phone: "3001234567", email: "proveedor@smile.test" },
      }),
    );
  });
}
