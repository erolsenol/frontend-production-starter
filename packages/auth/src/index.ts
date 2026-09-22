export interface Session { readonly userId: string; readonly email: string; readonly name: string; readonly expiresAt: string; }
export interface AuthContext { readonly headers?: Headers; }
export interface AuthAdapter { getSession(context?: AuthContext): Promise<Session | null>; signIn(input: { email: string; password: string }): Promise<Session>; signOut(): Promise<void>; }

export class UnauthenticatedError extends Error {
  readonly code = "UNAUTHENTICATED" as const;

  constructor() {
    super("Authentication is required.");
    this.name = "UnauthenticatedError";
  }
}

export const requireSession = async (adapter: AuthAdapter, context?: AuthContext): Promise<Session> => {
  const session = await adapter.getSession(context);
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

interface BetterAuthSessionShape { readonly user?: { readonly id?: unknown; readonly email?: unknown; readonly name?: unknown }; readonly session?: { readonly expiresAt?: unknown } }
interface BetterAuthApiShape { readonly api: { readonly getSession: (input: { readonly headers: Headers }) => Promise<unknown> } }
const isBetterAuthSession = (value: unknown): value is BetterAuthSessionShape => typeof value === "object" && value !== null && "user" in value && "session" in value;

export const createBetterAuthAdapter = (auth: BetterAuthApiShape): AuthAdapter => ({
  async getSession(context) {
    if (!context?.headers) return null;
    const value = await auth.api.getSession({ headers: context.headers });
    if (!isBetterAuthSession(value) || !value.user || !value.session) return null;
    const { id, email, name } = value.user;
    const expiresAt = value.session.expiresAt;
    if (typeof id !== "string" || typeof email !== "string" || typeof name !== "string") return null;
    const expiry = expiresAt instanceof Date ? expiresAt.toISOString() : typeof expiresAt === "string" ? expiresAt : null;
    return expiry ? { userId: id, email, name, expiresAt: expiry } : null;
  },
  async signIn() { throw new Error("Use Better Auth API for sign-in."); },
  async signOut() { throw new Error("Use Better Auth API for sign-out."); },
});
