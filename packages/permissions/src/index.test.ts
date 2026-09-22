import { describe, expect, it } from "vitest";
import { assertPermission, ForbiddenError } from "./index";

describe("assertPermission", () => {
  it("allows a granted permission", () => {
    expect(() => assertPermission({ permissions: ["users.read"] }, "users.read")).not.toThrow();
  });

  it("throws a typed forbidden error for a missing permission", () => {
    expect(() => assertPermission({ permissions: ["users.read"] }, "users.delete")).toThrowError(ForbiddenError);
  });
});
