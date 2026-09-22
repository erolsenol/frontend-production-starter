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

  it("creates and removes users through the repository contract", async () => {
    const repository = new InMemoryUserRepository(users);
    await expect(repository.create({ name: "Alex Morgan", email: "alex@example.com", role: "Viewer" })).resolves.toMatchObject({
      name: "Alex Morgan",
      status: "invited",
    });

    await expect(repository.remove("1")).resolves.toBe(true);
    await expect(repository.list()).resolves.toMatchObject({ pageInfo: { total: 2 }, items: [{ id: "usr_03" }, { id: "2" }] });
    await expect(repository.remove("missing")).resolves.toBe(false);
  });

  it("rejects invalid user input at the adapter boundary", async () => {
    const repository = new InMemoryUserRepository(users);
    await expect(repository.create({ name: "A", email: "invalid", role: "" })).rejects.toThrow();
  });

  it("updates a user and returns null for an unknown id", async () => {
    const repository = new InMemoryUserRepository(users);
    await expect(repository.update("1", { status: "suspended" })).resolves.toMatchObject({ id: "1", status: "suspended" });
    await expect(repository.update("missing", { status: "active" })).resolves.toBeNull();
  });
});
