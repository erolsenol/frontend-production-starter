import { describe, expect, it } from "vitest";
import type { UserSummary } from "@repo/contracts";
import { InMemoryUserRepository } from "./index";

const users: readonly UserSummary[] = [
  { id: "1", name: "Sarah Lee", email: "sarah@example.com", role: "Admin", status: "active", lastActive: "now" },
  { id: "2", name: "Marcus Kim", email: "marcus@example.com", role: "Developer", status: "invited", lastActive: "never" },
];

describe("InMemoryUserRepository", () => {
  it("filters and paginates users through the shared contracts", async () => {
    const repository = new InMemoryUserRepository(users);
    await expect(repository.list({ status: "active", page: 1, pageSize: 1 })).resolves.toMatchObject({
      items: [{ id: "1" }],
      pageInfo: { total: 1, totalPages: 1 },
    });
  });

  it("returns an empty page for an out-of-range page", async () => {
    const repository = new InMemoryUserRepository(users);
    await expect(repository.list({ page: 3, pageSize: 1 })).resolves.toMatchObject({ items: [], pageInfo: { total: 2, totalPages: 2 } });
  });
});
