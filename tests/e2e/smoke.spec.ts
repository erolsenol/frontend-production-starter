import { expect, test } from "@playwright/test";

test("admin users flow supports filtering", async ({ page }) => {
  await page.goto("/users");
  await page.waitForTimeout(1000);
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();

  const search = page.getByRole("searchbox", { name: "Search users" });
  await search.click();
  await search.pressSequentially("sarah");
  await expect(page.getByText("Sarah Lee")).toBeVisible();
  await expect(page.getByText("Marcus Kim")).not.toBeVisible();
});

test("docs app exposes onboarding guidance", async ({ page }) => {
  await page.goto("http://localhost:3102");
  await expect(page.getByRole("heading", { name: /Build your next app/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Minimal example" })).toBeVisible();
});

test("minimal example renders its first-run path", async ({ page }) => {
  await page.goto("http://localhost:3101");
  await expect(page.getByRole("heading", { name: /Start with a clean foundation/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /View on GitHub/i })).toHaveAttribute("href", /github\.com/);
});
