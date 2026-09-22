import { describe, expect, it } from "vitest";
import { GET } from "./route";
describe("audit logs API", () => { it("lists protected audit entries", async () => { const response = await GET(new Request("http://localhost/api/audit-logs?pageSize=2")); expect(response.status).toBe(200); await expect(response.json()).resolves.toMatchObject({ pageInfo: { pageSize: 2 }, items: expect.any(Array) }); }); });
