import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  use: { baseURL, locale: "es-CO", timezoneId: "America/Bogota" },
  projects: [{ name: "android-gama-baja", use: { ...devices["Pixel 5"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: "npm run start", url: `${baseURL}/api/health`, reuseExistingServer: true, timeout: 120_000 },
});
