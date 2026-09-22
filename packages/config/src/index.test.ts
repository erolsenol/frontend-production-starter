import { describe, expect, it } from "vitest";
import { getAppConfig, InvalidProductionConfigError } from "./index";

describe("runtime configuration", () => {
  it("uses safe demo defaults for local development", () => {
    expect(getAppConfig({ NODE_ENV: "development" })).toMatchObject({ demoMode: true, authProvider: "demo", dataSource: "memory" });
  });

  it("rejects demo infrastructure in production", () => {
    expect(() => getAppConfig({ NODE_ENV: "production", DEMO_MODE: "true" })).toThrowError(InvalidProductionConfigError);
    expect(() => getAppConfig({ NODE_ENV: "production", DEMO_MODE: "false", AUTH_PROVIDER: "oidc", DATA_SOURCE: "postgres" })).not.toThrow();
  });

  it("rejects malformed values at the runtime boundary", () => {
    expect(() => getAppConfig({ NODE_ENV: "production", DEMO_MODE: "false", AUTH_PROVIDER: "", DATA_SOURCE: "postgres" })).toThrowError(InvalidProductionConfigError);
  });
});
