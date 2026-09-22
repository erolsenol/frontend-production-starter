import { describe, expect, it } from "vitest";
import { createStructuredLogger } from "./index";
describe("structured logger", () => {
  it("redacts common secret fields before sending an entry to the sink", () => {
    const entries: unknown[] = [];
    createStructuredLogger((entry) => entries.push(entry)).error("request failed", { requestId: "req_1", authorization: "Bearer secret" });
    expect(entries[0]).toMatchObject({ level: "error", context: { requestId: "req_1", authorization: "[REDACTED]" } });
  });
});
