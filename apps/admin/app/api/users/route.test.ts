import { describe, expect, it } from "vitest";
import { DELETE } from "./[id]/route";
import { GET, POST } from "./route";

describe("users API", () => {
  it("lists users with validated filters", async () => {
    const response = await GET(new Request("http://localhost/api/users?status=active&pageSize=1"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ pageInfo: { total: 3, pageSize: 1 }, items: [{ status: "active" }] });
  });

  it("rejects invalid input and creates valid invitations", async () => {
    const invalid = await POST(new Request("http://localhost/api/users", { method: "POST", body: "not-json" }));
    expect(invalid.status).toBe(422);

    const created = await POST(new Request("http://localhost/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Taylor Reed", email: "taylor@example.com", role: "Viewer" }),
    }));
    expect(created.status).toBe(201);
    await expect(created.json()).resolves.toMatchObject({ name: "Taylor Reed", status: "invited" });
  });

  it("returns not found when deleting an unknown user", async () => {
    const response = await DELETE(new Request("http://localhost/api/users/missing", { method: "DELETE" }), { params: Promise.resolve({ id: "missing" }) });
    expect(response.status).toBe(404);
  });
});
