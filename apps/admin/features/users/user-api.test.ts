import { afterEach, describe, expect, it, vi } from "vitest";
import { listUsers, updateUserStatus } from "./user-api";

afterEach(() => vi.unstubAllGlobals());

describe("users API adapter", () => {
  it("parses a paginated users response", async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ items: [{ id: "1", name: "Sarah Lee", email: "sarah@example.com", role: "Viewer", status: "active", lastActive: "now" }], pageInfo: { page: 1, pageSize: 4, total: 1, totalPages: 1 } }), { status: 200 })));
    await expect(listUsers({ query: "", status: "all", page: 1, pageSize: 4 })).resolves.toMatchObject({ pageInfo: { total: 1 } });
  });

  it("rejects an invalid server response", async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(new Response("{}", { status: 200 })));
    await expect(updateUserStatus("1", "active")).rejects.toThrow("invalid users response");
  });
});
