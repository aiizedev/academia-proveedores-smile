import { expect, test, type Page } from "@playwright/test";
import bank from "../../../contracts/fixtures/question-bank.json";
import { acceptConsent, completeProfile, installApp, seedProveedorSession } from "./session";

/* HU-ASM-03/05 · HU-IMP-01…03 en modo avión: una pregunta por pantalla, pausa y
   reanudación, declaración, envío, diagnóstico, plan y checklist. */
const questions = (bank.sections as Array<{ questions: Array<{ id: string; text: string }> }>).flatMap((s) => s.questions);
const textOf = (id: string) => questions.find((q) => q.id === id)!.text;

async function answerCurrent(page: Page) {
  const heading = page.getByRole("heading", { level: 1 });
  const before = await heading.innerText();
  const firstOption = page.locator("fieldset label").first();
  if (await firstOption.isVisible()) {
    await firstOption.click(); // multiselección
    await page.getByRole("button", { name: "Continuar" }).click();
  } else {
    await page.getByRole("button", { name: "Sí", exact: true }).click();
    const more = page.getByRole("button", { name: "Continuar" });
    if (await more.isVisible().catch(() => false)) await more.click(); // detalle opcional
  }
  await expect(heading).not.toHaveText(before);
}

test("R1 sin conexión: autoevaluación, diagnóstico y plan de 3 metas", async ({ page, context }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" }); // avance a 150 ms
  await seedProveedorSession(context);
  await installApp(page);
  await context.setOffline(true);
  await page.reload();
  await acceptConsent(page);
  await completeProfile(page);

  await page.goto("/app/autoevaluacion");
  await page.getByRole("button", { name: "Empezar" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(textOf("amb-01"));
  await expect(page.getByRole("button", { name: "Sí", exact: true })).toHaveCSS("min-height", "73.6px");

  for (let i = 0; i < 4; i++) await answerCurrent(page);

  // Pausa: recargar sin red retoma en la quinta pregunta.
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(textOf("amb-05"));
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", /\d+/);
  await expect(page.getByText(/^4 de \d+$/)).toBeVisible();

  for (let guard = 0; guard < 60; guard++) {
    if (await page.getByRole("heading", { name: /Declaración de/ }).isVisible()) break;
    await answerCurrent(page);
  }

  const send = page.getByRole("button", { name: "Enviar" });
  await expect(send).toBeDisabled();
  await page.getByText(/Declaro que la información/).click();
  await page.getByLabel("Escriba su nombre completo").fill("María Fernanda Rojas");
  await expect(send).toBeEnabled();
  await send.click();
  await expect(page).toHaveURL(/\/app\/diagnostico$/);

  // HU-ASM-05: diagnóstico offline. Con "Sí" a todo, ext-18 (menor en labor
  // prohibida, polaridad negativa) dispara la alerta y la meta urgente.
  await expect(page.getByRole("img", { name: /^Puntaje \d+ de 100$/ })).toBeVisible();
  await expect(page.getByText(/^Está a \d+ % de la certificación BPA del ICA\.$/)).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "Identificamos un riesgo que requiere atención inmediata." })).toBeVisible();
  await expect(page.getByText("Su siguiente paso")).toBeVisible();
  await expect(page.getByText("Urgente").first()).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/\b(GRI|TCFD|SASB)\b/);

  // HU-IMP-01/02/03: plan de 3 metas, guía offline y checklist que completa la meta.
  await page.goto("/app/plan");
  const cards = page.locator("main a[href^='/app/plan/']");
  await expect(cards).toHaveCount(3);
  await cards.first().click();
  await expect(page.getByText("Paso a paso")).toBeVisible();
  await expect(page.getByText(/^Fuente: /)).toBeVisible();
  await expect(page.getByText("Fecha límite")).toBeVisible();
  const items = page.locator("main label:has(input[type=checkbox])");
  await expect(items).toHaveCount(4);
  for (let i = 0; i < 4; i++) await items.nth(i).click();
  await expect(page.getByRole("status").filter({ hasText: "Meta completa" })).toBeVisible();
  await page.reload();
  await expect(page.getByText("4 de 4")).toBeVisible();
  await items.nth(3).click();
  await expect(page.getByText("En progreso")).toBeVisible();

  await page.goto("/app/autoevaluacion");
  await expect(page.getByRole("heading", { name: /Autoevaluación enviada/ })).toBeVisible();
});
