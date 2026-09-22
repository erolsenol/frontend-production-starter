import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { databaseSchema } from "@repo/database";

export interface BetterAuthConfig { readonly secret: string; readonly baseURL: string; readonly trustedOrigins?: readonly string[]; }

export const createBetterAuth = (db: NeonHttpDatabase<typeof databaseSchema>, config: BetterAuthConfig) => {
  if (config.secret.length < 32) throw new Error("BETTER_AUTH_SECRET must be at least 32 characters.");
  return betterAuth({ database: drizzleAdapter(db, { provider: "pg" }), secret: config.secret, baseURL: config.baseURL, trustedOrigins: [...(config.trustedOrigins ?? [])], emailAndPassword: { enabled: true } });
};
