import { describe, expect, it } from "vitest";
import { activities, users } from "./mock-data";

describe("mock admin data", () => {
  it("provides stable activity identifiers", () => {
    expect(new Set(activities.map((activity) => activity.id)).size).toBe(activities.length);
  });

  it("contains users with supported statuses", () => {
    expect(users.every((user) => ["active", "invited", "suspended"].includes(user.status))).toBe(true);
  });
});
