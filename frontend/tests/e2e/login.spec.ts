import { expect, test, type Page } from "@playwright/test";

/* HU-IAM-02 · CU-02. La API se simula: el contrato es contracts/openapi.json. */
const API = "http://localhost:8000/api/v1/auth/login";
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type", "access-control-allow-methods": "POST" };

async function mockLogin(page: Page, status: number, body: unknown) {
  await page.route(API, (route) =>
    route.request().method() === "OPTIONS"
      ? route.fulfill({ status: 204, headers: CORS })
      : route.fulfill({ status, headers: { ...CORS, "content-type": "application/json" }, body: JSON.stringify(body) }),
  );
}

test("sin sesión, /app lleva a ingresar y el proveedor vuelve a la PWA", async ({ page }) => {
  await mockLogin(page, 200, {
    access_token: "a",
    refresh_token: "r".repeat(32),
    token_type: "bearer",
    expires_in: 900,
    user: { id: "00000000-0000-4000-8000-000000000001", full_name: "Finca La Esperanza", role: "PROVEEDOR", phone: "3001234567", email: "proveedor@smile.test" },
  });

  await page.goto("/app");
  await expect(page).toHaveURL(/\/ingresar\?next=%2Fapp$/);

  await page.getByLabel("Celular o correo").fill("300 123 4567");
  await page.getByLabel("Contraseña").fill("Smile2026!");
  const request = page.waitForRequest((r) => r.url() === API && r.method() === "POST");
  await page.getByRole("button", { name: "Ingresar" }).click();
  expect((await request).postDataJSON()).toEqual({ identifier: "3001234567", password: "Smile2026!" });

  // Primer ingreso: la guardia de consentimiento toma el relevo (HU-PRV-01).
  await expect(page).toHaveURL(/\/app\/consentimiento$/);
});

test("cuenta en pausa por intentos fallidos", async ({ page }) => {
  await mockLogin(page, 423, { error: { code: "ACCOUNT_LOCKED", message: "locked", details: null, request_id: "e2e" } });
  await page.goto("/ingresar");
  await page.getByLabel("Celular o correo").fill("proveedor@smile.test");
  await page.getByLabel("Contraseña").fill("Smile2026!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Por seguridad" })).toHaveText("Por seguridad, su cuenta está en pausa 15 minutos.");
});

test("celular incompleto se corrige antes de enviar", async ({ page }) => {
  await page.goto("/ingresar");
  await page.getByLabel("Celular o correo").fill("300123");
  await page.getByLabel("Contraseña").fill("x");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByText("Escriba su celular de 10 dígitos o su correo.")).toBeVisible();
});
