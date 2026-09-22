import { describe, expect, it } from "vitest";
import { requireAdminPermission } from "./access";

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
});
