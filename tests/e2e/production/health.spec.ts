import { expect, test } from "@playwright/test";

const productionURL = process.env.PRODUCTION_E2E_URL;

test.skip(!productionURL, "Set PRODUCTION_E2E_URL to run against a deployed reference app.");

test("public production recovery pages are reachable", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Hoş geldiniz" })).toBeVisible();
  await page.getByRole("link", { name: "Parolamı unuttum" }).click();
  await expect(page.getByRole("heading", { name: "Parolanızı sıfırlayın" })).toBeVisible();
  await page.goto("/reset-password");
  await expect(page.getByRole("heading", { name: "Yeni parola belirleyin" })).toBeVisible();
});

test("production readiness responds from the deployed target", async ({ request }) => {
  const response = await request.get("/api/health/ready");
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({ status: "ready" });
});
