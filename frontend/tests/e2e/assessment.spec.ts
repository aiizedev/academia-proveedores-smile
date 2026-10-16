import { expect, test, type Page } from "@playwright/test";
import bank from "../../../contracts/fixtures/question-bank.json";
import { acceptConsent, completeProfile, installApp, seedProveedorSession } from "./session";

/* HU-ASM-03 · CU-05 en modo avión: una pregunta por pantalla, pausa y
   reanudación, declaración obligatoria y envío bloqueado para edición. */
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

test("autoevaluación sin conexión: pausa, reanuda, declara y envía", async ({ page, context }) => {
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

  await page.goto("/app/autoevaluacion");
  await expect(page.getByRole("heading", { name: /Autoevaluación enviada/ })).toBeVisible();
});
