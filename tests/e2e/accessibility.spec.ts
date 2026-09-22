import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("admin dashboard has no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious")).toEqual([]);
});

test("docs landing page exposes a stable visual smoke surface", async ({ page }) => {
  await page.goto("http://localhost:3102");
  await expect(page.getByRole("heading", { name: /Build your next app/i })).toBeVisible();
  const screenshot = await page.locator("main.docs").screenshot({ animations: "disabled" });
  expect(screenshot.byteLength).toBeGreaterThan(10_000);
  await expect(page.locator("main.docs header, main.docs .docs-hero, main.docs .package-section")).toHaveCount(3);
});
