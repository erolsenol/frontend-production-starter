import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("readiness endpoint", () => {
  it("returns a non-cacheable local readiness response", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({ status: "ready", checks: { authAdapter: "demo", dataAdapter: "memory" } });
  });
});
