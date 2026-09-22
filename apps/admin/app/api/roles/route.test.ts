import { describe, expect, it } from "vitest";
import { DELETE, PATCH } from "./[id]/route";
import { GET, POST } from "./route";

describe("roles API", () => {
  it("lists roles with the canonical permission catalog", async () => {
    const response = await GET(new Request("http://localhost/api/roles"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ items: expect.arrayContaining([expect.objectContaining({ id: "role_01" })]), permissions: expect.arrayContaining(["roles.manage"]) });
  });

  it("creates valid roles and rejects unknown permissions", async () => {
    const invalid = await POST(new Request("http://localhost/api/roles", { method: "POST", body: JSON.stringify({ name: "Bad", description: "Bad role", permissions: ["nope"] }) }));
    expect(invalid.status).toBe(422);
    const created = await POST(new Request("http://localhost/api/roles", { method: "POST", body: JSON.stringify({ name: "Support", description: "Support role", permissions: ["users.read"] }) }));
    expect(created.status).toBe(201);
  });

  it("protects system roles from mutation and deletion", async () => {
    const patch = await PATCH(new Request("http://localhost/api/roles/role_01", { method: "PATCH", body: JSON.stringify({ name: "Changed" }) }), { params: Promise.resolve({ id: "role_01" }) });
    expect(patch.status).toBe(404);
    const remove = await DELETE(new Request("http://localhost/api/roles/role_01", { method: "DELETE" }), { params: Promise.resolve({ id: "role_01" }) });
    expect(remove.status).toBe(404);
  });
});
