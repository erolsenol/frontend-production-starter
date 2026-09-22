import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { databaseSchema } from "@repo/database";
import type { EmailSender } from "@repo/email";

export interface BetterAuthConfig { readonly secret: string; readonly baseURL: string; readonly trustedOrigins?: readonly string[]; readonly emailSender?: EmailSender; readonly emailFrom?: string; }

export const createBetterAuth = (db: NeonHttpDatabase<typeof databaseSchema>, config: BetterAuthConfig) => {
  if (config.secret.length < 32) throw new Error("BETTER_AUTH_SECRET must be at least 32 characters.");
  const deliver = async (to: string, subject: string, url: string): Promise<void> => {
    if (!config.emailSender) return;
    await config.emailSender.send({ to, from: config.emailFrom ?? "noreply@example.com", subject, text: url, html: `<p><a href="${url}">${subject}</a></p>` });
  };
  return betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    secret: config.secret,
    baseURL: config.baseURL,
    trustedOrigins: [...(config.trustedOrigins ?? [])],
    emailVerification: config.emailSender ? { sendOnSignUp: true, sendVerificationEmail: ({ user, url }) => deliver(user.email, "Verify your email", url) } : undefined,
    emailAndPassword: { enabled: true, requireEmailVerification: Boolean(config.emailSender), sendResetPassword: config.emailSender ? ({ user, url }) => deliver(user.email, "Reset your password", url) : undefined },
  });
};
