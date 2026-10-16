import { expect, test } from "@playwright/test";
import { seedProveedorSession } from "./session";

/* HU-PRV-01 + HU-SYN-01: en modo avión, /app lleva a la autorización; aceptar
   guarda el registro en WatermelonDB, desbloquea /app y sobrevive a recargar. */
test("autorización de datos sin conexión", async ({ page, context }) => {
  await seedProveedorSession(context);
  const apiCalls: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("/api/v1/")) apiCalls.push(req.url());
  });

  await page.goto("/app");
  await page.waitForFunction(async () => {
    await navigator.serviceWorker.ready;
    return navigator.serviceWorker.controller !== null;
  });
  await context.setOffline(true);
  await page.reload();

  await expect(page).toHaveURL(/\/app\/consentimiento$/);
  await expect(page.getByText("sostenibilidad@smilebogota.com").first()).toBeVisible();

  const accept = page.getByRole("button", { name: "Acepto", exact: true });
  await expect(accept).toBeDisabled();
  await page.getByText("Autorizo el tratamiento de mis datos personales").click();
  await expect(accept).toBeEnabled();
  await accept.click();

  await expect(page.getByRole("heading", { name: "Datos sensibles (opcional)" })).toBeVisible();
  // Regresión RNF-OFF-003: escribir y navegar sin red de inmediato fuerza una
  // recarga completa; sin flushLocalDb() el registro se perdía (autosave 500 ms).
  await page.getByRole("button", { name: "No autorizo", exact: true }).click();

  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: /Su finca/ })).toBeVisible();

  // Persistencia local: sigue autorizado tras recargar sin red.
  await page.reload();
  await expect(page.getByRole("heading", { name: /Su finca/ })).toBeVisible();
  await expect(page).toHaveURL(/\/app$/);

  expect(apiCalls).toEqual([]);
});
