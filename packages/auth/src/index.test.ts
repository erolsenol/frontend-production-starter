import { describe, expect, it } from "vitest";
import { createBetterAuthAdapter, createStaticAuthAdapter, isSessionValid, requireSession, UnauthenticatedError } from "./index";

const session = { userId: "user_1", email: "user@example.com", name: "User", expiresAt: "2027-01-01T00:00:00.000Z" } as const;

describe("auth session boundaries", () => {
  it("rejects expired sessions", () => {
    expect(isSessionValid(session, Date.parse("2027-01-02T00:00:00.000Z"))).toBe(false);
  });

  it("returns only a valid static session", async () => {
    await expect(createStaticAuthAdapter(session).getSession()).resolves.toEqual(session);
  });

  it("requires a session at the server boundary", async () => {
    await expect(requireSession(createStaticAuthAdapter(session))).resolves.toEqual(session);
    await expect(requireSession(createStaticAuthAdapter(null))).rejects.toBeInstanceOf(UnauthenticatedError);
  });

  it("maps a provider session using request headers", async () => {
    const adapter = createBetterAuthAdapter({ api: { getSession: async () => ({ user: { id: "provider_1", email: "provider@example.com", name: "Provider" }, session: { expiresAt: "2027-01-01T00:00:00.000Z" } }) } });
    await expect(adapter.getSession({ headers: new Headers({ cookie: "session=valid" }) })).resolves.toMatchObject({ userId: "provider_1", email: "provider@example.com" });
  });
});
