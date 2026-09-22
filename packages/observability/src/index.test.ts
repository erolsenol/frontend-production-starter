import { describe, expect, it } from "vitest";
import { createTelemetry } from "./index";
describe("observability boundary", () => { it("creates provider-neutral trace and metric instruments", () => { const telemetry = createTelemetry("admin"); expect(telemetry.tracer).toBeDefined(); expect(telemetry.requestCounter).toBeDefined(); expect(telemetry.requestDuration).toBeDefined(); expect(() => telemetry.recordRequest({ requestId: "req_1", route: "/api/users", method: "GET", status: 200, durationMs: 2 })).not.toThrow(); }); });
