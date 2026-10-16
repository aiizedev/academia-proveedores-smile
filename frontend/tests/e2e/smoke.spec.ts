import { expect, test } from "@playwright/test";

test("healthcheck responde ok", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  expect(await res.json()).toEqual({ status: "ok" });
});

test("la PWA del proveedor muestra la tabbar con 4 secciones con texto", async ({ page }) => {
  await page.goto("/app");
  const nav = page.getByRole("navigation", { name: "Secciones" });
  await expect(nav.getByRole("link")).toHaveCount(4);
  for (const label of ["Diagnóstico", "Guías", "Ruta", "Ficha"]) {
    await expect(nav.getByRole("link", { name: label })).toBeVisible();
  }
});
