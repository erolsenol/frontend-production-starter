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

test("admin users flow creates an invitation", async ({ page }) => {
  await page.goto("/users");
  await page.getByRole("button", { name: /Invite user/ }).click();
  await expect(page.getByRole("dialog", { name: "Invite user" })).toBeVisible();
  const dialog = page.getByRole("dialog", { name: "Invite user" });
  await dialog.getByRole("textbox").nth(0).fill("Alex Morgan");
  await dialog.getByRole("textbox").nth(1).fill("alex@example.com");
  await dialog.getByRole("button", { name: "Invite user" }).click();
  await expect(page.getByText("Invitation created")).toBeVisible();
  await page.getByRole("searchbox", { name: "Search users" }).fill("alex@example.com");
  await expect(page.getByText("Alex Morgan")).toBeVisible();
});

test("admin users invite dialog supports keyboard dismissal", async ({ page }) => {
  await page.goto("/users");
  await page.getByRole("button", { name: /Invite user/ }).click();
  const dialog = page.getByRole("dialog", { name: "Invite user" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close invite dialog" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("admin users flow confirms destructive removal", async ({ page }) => {
  await page.goto("/users");
  await page.getByRole("button", { name: "Delete Marcus Kim" }).click();
  const dialog = page.getByRole("dialog", { name: "Remove user" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Marcus Kim");
  await dialog.getByRole("button", { name: "Remove user", exact: true }).click();
  await expect(page.getByRole("button", { name: "Delete Marcus Kim" })).not.toBeVisible();
});

test("admin users flow updates status through the API", async ({ page }) => {
  await page.goto("/users");
  const status = page.getByRole("combobox", { name: "Update status for Daniel Torres" });
  await status.selectOption("active");
  await expect(status).toHaveValue("active");
  await expect(page.getByText("User updated")).toBeVisible();
});

test("admin health endpoint reports readiness", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({ status: "ok", service: "admin" });
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
