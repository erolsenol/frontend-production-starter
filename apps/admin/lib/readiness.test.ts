import { describe, expect, it } from "vitest";
import { getReadiness } from "./readiness";
describe("readiness", () => {
  it("reports local demo readiness explicitly", () => {
    expect(getReadiness({ NODE_ENV: "development" })).toEqual({ status: "ready", checks: { configuration: "ok", authAdapter: "demo", dataAdapter: "memory" } });
  });
  it("keeps production unready until real adapters are wired", () => {
    expect(getReadiness({ NODE_ENV: "production", DEMO_MODE: "false", AUTH_PROVIDER: "oidc", DATA_SOURCE: "postgres" })).toMatchObject({ status: "not_ready", checks: { authAdapter: "not_configured", dataAdapter: "not_configured" } });
  });
});
