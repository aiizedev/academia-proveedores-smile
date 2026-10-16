import { expect, test } from "@playwright/test";
import { seedProveedorSession } from "./session";

/* HU-PLAT-03 / HU-DS-02: tras una visita con red, el shell de /app abre en
   modo avión desde el service worker, con fuentes locales y sin /smile en caché. */
test("el shell de /app funciona sin conexión", async ({ page, context }) => {
  await seedProveedorSession(context);
  const external: string[] = [];
  page.on("request", (req) => {
    if (!req.url().startsWith(new URL(page.url() || "http://localhost").origin) && req.url().startsWith("http")) {
      external.push(req.url());
    }
  });

  await page.goto("/app");
  await page.waitForFunction(async () => {
    await navigator.serviceWorker.ready;
    return navigator.serviceWorker.controller !== null;
  });

  const cached = await page.evaluate(async () => {
    const urls: string[] = [];
    for (const name of await caches.keys()) {
      for (const req of await (await caches.open(name)).keys()) urls.push(req.url);
    }
    return urls;
  });
  expect(cached.some((url) => url.includes("/(proveedor)/app/"))).toBe(true);
  expect(cached.filter((url) => decodeURIComponent(url).includes("/(backoffice)/"))).toEqual([]);

  await context.setOffline(true);
  await page.reload();

  await expect(page.getByRole("navigation", { name: "Secciones" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText(/Sin conexión/);
  await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe("loaded");
  expect(external.filter((url) => url.includes("fonts.googleapis.com") || url.includes("fonts.gstatic.com"))).toEqual([]);
});
