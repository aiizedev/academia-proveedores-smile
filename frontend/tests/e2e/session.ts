import { expect, type BrowserContext, type Page } from "@playwright/test";

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

/** Visita /app con red hasta que el service worker controla la página. */
export async function installApp(page: Page): Promise<void> {
  await page.goto("/app");
  await page.waitForFunction(async () => {
    await navigator.serviceWorker.ready;
    return navigator.serviceWorker.controller !== null;
  });
}

/** Acepta la autorización general y declina la sensible (CU-03). */
export async function acceptConsent(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/app\/consentimiento$/);
  await page.getByText("Autorizo el tratamiento de mis datos personales").click();
  await page.getByRole("button", { name: "Acepto", exact: true }).click();
  await page.getByRole("button", { name: "No autorizo", exact: true }).click();
  await expect(page).toHaveURL(/\/app$/);
}
