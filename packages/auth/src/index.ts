export interface Session { readonly userId: string; readonly email: string; readonly name: string; readonly expiresAt: string; }
export interface AuthAdapter { getSession(): Promise<Session | null>; signIn(input: { email: string; password: string }): Promise<Session>; signOut(): Promise<void>; }
export const createDemoAuthAdapter = (): AuthAdapter => ({
  async getSession() { return { userId: "demo-user", email: "demo@example.com", name: "Demo User", expiresAt: new Date(Date.now() + 86_400_000).toISOString() }; },
  async signIn(input) { return { userId: "demo-user", email: input.email, name: "Demo User", expiresAt: new Date(Date.now() + 86_400_000).toISOString() }; },
  async signOut() { return undefined; },
});
