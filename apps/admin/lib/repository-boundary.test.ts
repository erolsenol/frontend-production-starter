import { afterEach, describe, expect, it } from "vitest";
import { configureRoleRepository, getRoleRepository } from "./role-repository";
import { configureUserRepository, getUserRepository } from "./user-repository";

describe("demo repository boundaries", () => {
  const previous = process.env.DEMO_MODE;

  afterEach(() => {
    configureUserRepository(null);
    configureRoleRepository(null);
    if (previous === undefined) delete process.env.DEMO_MODE;
    else process.env.DEMO_MODE = previous;
  });

  it("allows disposable repositories in test mode", () => {
    process.env.DEMO_MODE = "true";
    expect(getUserRepository()).toBeDefined();
    expect(getRoleRepository()).toBeDefined();
  });

  it("refuses memory repositories when demo mode is disabled", () => {
    process.env.DEMO_MODE = "false";
    expect(() => getUserRepository()).toThrow("provider-backed user repository");
    expect(() => getRoleRepository()).toThrow("provider-backed role repository");
  });
});
