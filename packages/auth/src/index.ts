export interface Session { readonly userId: string; readonly email: string; readonly name: string; readonly expiresAt: string; }
export interface AuthAdapter { getSession(): Promise<Session | null>; signIn(input: { email: string; password: string }): Promise<Session>; signOut(): Promise<void>; }

export class UnauthenticatedError extends Error {
  readonly code = "UNAUTHENTICATED" as const;

  constructor() {
    super("Authentication is required.");
    this.name = "UnauthenticatedError";
  }
}

export const requireSession = async (adapter: AuthAdapter): Promise<Session> => {
  const session = await adapter.getSession();
  if (!session) throw new UnauthenticatedError();
  return session;
};
export const isSessionValid = (session: Session, now = Date.now()): boolean => {
  const expiresAt = Date.parse(session.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt > now;
};

export const createStaticAuthAdapter = (session: Session | null): AuthAdapter => ({
  async getSession() { return session && isSessionValid(session) ? session : null; },
  async signIn() { if (!session) throw new Error("No static session configured"); return session; },
  async signOut() { return undefined; },
});

export const createDemoAuthAdapter = (): AuthAdapter => ({
  async getSession() { return { userId: "demo-user", email: "demo@example.com", name: "Demo User", expiresAt: new Date(Date.now() + 86_400_000).toISOString() }; },
  async signIn(input) { return { userId: "demo-user", email: input.email, name: "Demo User", expiresAt: new Date(Date.now() + 86_400_000).toISOString() }; },
  async signOut() { return undefined; },
});
