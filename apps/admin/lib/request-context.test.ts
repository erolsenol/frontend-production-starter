import { describe, expect, it } from "vitest";
import { getRequestId, isSameOriginMutation, withRequestId } from "./request-context";
describe("request context", () => {
  it("preserves bounded request ids and generates one otherwise", () => {
    expect(getRequestId(new Request("http://localhost/api", { headers: { "x-request-id": "client_1" } }))).toBe("client_1");
    expect(getRequestId(new Request("http://localhost/api", { headers: { "x-request-id": "bad value" } }))).toMatch(/^[0-9a-f-]{36}$/);
  });
  it("rejects cross-origin mutations and adds correlation headers", () => {
    expect(isSameOriginMutation(new Request("https://app.example/api", { headers: { origin: "https://evil.example" } }))).toBe(false);
    expect(withRequestId(new Response(null, { status: 204 }), "req_1").headers.get("x-request-id")).toBe("req_1");
  });
});
