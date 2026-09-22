import { describe, expect, it } from "vitest";
import { createStaticAuthAdapter } from "@repo/auth";
import { createAdminPermissionGuard, requireAdminPermission } from "./access";

describe("admin access boundary", () => {
  it("allows demo access outside production", async () => {
    await expect(requireAdminPermission("users.read")).resolves.toMatchObject({ permissions: expect.arrayContaining(["users.read"]) });
  });

  it("denies demo access when production mode disables it", async () => {
    const previous = process.env.DEMO_MODE;
    process.env.DEMO_MODE = "false";
    await expect(requireAdminPermission("users.read")).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
    if (previous === undefined) delete process.env.DEMO_MODE;
    else process.env.DEMO_MODE = previous;
  });

  it("enforces provider permissions after session authentication", async () => {
    const guard = createAdminPermissionGuard({
      auth: createStaticAuthAdapter({ userId: "user_1", email: "user@example.com", name: "User", expiresAt: "2027-01-01T00:00:00.000Z" }),
      permissions: ["users.read"],
    });

    await expect(guard("users.read")).resolves.toMatchObject({ permissions: ["users.read"] });
    await expect(guard("users.delete")).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
