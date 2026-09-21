import { describe, expect, it } from "vitest";
import { users } from "./mock-data";
import { filterUsers } from "./user-filters";

describe("filterUsers", () => {
  it("filters by normalized name or email", () => {
    expect(filterUsers(users, { query: "  SARAH ", status: "all" }).map((user) => user.id)).toEqual(["usr_01"]);
  });

  it("combines status and query filters", () => {
    expect(filterUsers(users, { query: "", status: "invited" }).map((user) => user.id)).toEqual(["usr_03"]);
  });
});
