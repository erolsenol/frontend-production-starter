import { describe, expect, it } from "vitest";
import type { UserSummary } from "@repo/contracts";
import { InMemoryUserRepository } from "./index";
import { InMemoryRoleRepository } from "./index";

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
    await expect(repository.list()).resolves.toMatchObject({ pageInfo: { total: 2 }, items: [{ id: "usr_01" }, { id: "2" }] });
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

  it("keeps generated ids unique after deleting a middle record", async () => {
    const repository = new InMemoryUserRepository([
      { id: "usr_01", name: "One User", email: "one@example.com", role: "Viewer", status: "active", lastActive: "now" },
      { id: "usr_02", name: "Two User", email: "two@example.com", role: "Viewer", status: "active", lastActive: "now" },
      { id: "usr_03", name: "Three User", email: "three@example.com", role: "Viewer", status: "active", lastActive: "now" },
    ]);

    await repository.remove("usr_02");
    await expect(repository.create({ name: "Four User", email: "four@example.com", role: "Viewer" })).resolves.toMatchObject({ id: "usr_04" });
  });
});

describe("InMemoryRoleRepository", () => {
  it("creates roles with validated canonical permissions", async () => {
    const repository = new InMemoryRoleRepository([{ id: "role_01", name: "Viewer", description: "Read only", permissions: ["users.read"], members: 0, system: true }]);
    await expect(repository.create({ name: "Support", description: "Support access", permissions: ["users.read", "users.update"] })).resolves.toMatchObject({ id: "role_02", system: false, permissions: ["users.read", "users.update"] });
    await expect(repository.create({ name: "Broken", description: "Invalid", permissions: ["unknown.permission"] })).rejects.toThrow("Unknown permission");
  });

  it("does not mutate or delete system roles", async () => {
    const repository = new InMemoryRoleRepository([{ id: "role_01", name: "Viewer", description: "Read only", permissions: ["users.read"], members: 0, system: true }]);
    await expect(repository.update("role_01", { name: "Changed" })).resolves.toBeNull();
    await expect(repository.remove("role_01")).resolves.toBe(false);
  });
});
