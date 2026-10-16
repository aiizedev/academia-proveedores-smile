import { expect, test } from "@playwright/test";
import { acceptConsent, installApp, seedProveedorSession } from "./session";

/* HU-SUP-01 · CU-04 en modo avión: DV validado, municipios del departamento
   elegido, guardado local y ficha intacta al recargar. */
test("ficha de identificación sin conexión", async ({ page, context }) => {
  await seedProveedorSession(context);
  await installApp(page);
  await context.setOffline(true);
  await page.reload();
  await acceptConsent(page);

  await page.goto("/app/ficha");
  await expect(page.getByRole("heading", { name: "Identificación" })).toBeVisible();
  await page.getByText("Persona natural").click();
  await page.getByLabel("NIT o cédula").fill("900.123.456");
  await page.getByLabel("DV").fill("7");
  await page.getByLabel("Nombre completo").fill("María Fernanda Rojas");
  await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(page.getByText("El dígito de verificación no coincide. Revíselo en su RUT.")).toBeVisible();
  await page.getByLabel("DV").fill("8");
  await page.getByRole("button", { name: "Siguiente" }).click();

  await expect(page.getByRole("heading", { name: "Ubicación" })).toBeVisible();
  await expect(page.getByLabel("Municipio")).toBeDisabled();
  await page.getByLabel("Departamento").selectOption({ label: "Cundinamarca" });
  const municipios = await page.getByLabel("Municipio").locator("option:not([disabled])").allTextContents();
  expect(municipios).toContain("Fusagasugá");
  expect(municipios).not.toContain("Tunja");
  await page.getByLabel("Municipio").selectOption({ label: "Fusagasugá" });
  await page.getByLabel("Vereda (opcional)").fill("El Placer");
  await page.getByRole("button", { name: "Siguiente" }).click();

  await expect(page.getByRole("heading", { name: "Contacto y categoría" })).toBeVisible();
  await page.getByText("WhatsApp").click();
  await page.getByLabel("Categoría principal").selectOption("fruver");
  await page.getByRole("button", { name: "Guardar ficha" }).click();

  await expect(page.getByRole("heading", { name: /Ficha guardada/ })).toBeVisible();
  await expect(page.getByText("El Placer · Fusagasugá, Cundinamarca")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: /Ficha guardada/ })).toBeVisible();
  await expect(page.getByText("900123456-8")).toBeVisible();
});
