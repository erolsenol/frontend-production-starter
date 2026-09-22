import { createNeonDatabase } from "@repo/database";
import { createBetterAuth } from "@repo/auth/better-auth";
import { createBetterAuthAdapter } from "@repo/auth";
import { createDrizzleAuditRepository, createDrizzlePermissionResolver, createDrizzleRoleRepository, createDrizzleUserRepository } from "@repo/database/repositories";
import { configureAdminAccess } from "./access";
import { configureRoleRepository } from "./role-repository";
import { configureUserRepository } from "./user-repository";
import { configureAuditRepository } from "./audit-repository";

let configured = false;

export const ensureProductionComposition = (): boolean => {
  if (configured) return true;
  const databaseUrl = process.env.DATABASE_URL;
  const secret = process.env.BETTER_AUTH_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!databaseUrl || !secret || !baseURL) return false;
  const database = createNeonDatabase(databaseUrl);
  const auth = createBetterAuth(database, { secret, baseURL, trustedOrigins: [baseURL] });
  configureAdminAccess({ auth: createBetterAuthAdapter(auth), permissions: createDrizzlePermissionResolver(database) });
  configureUserRepository(createDrizzleUserRepository(database));
  configureRoleRepository(createDrizzleRoleRepository(database));
  configureAuditRepository(createDrizzleAuditRepository(database));
  configured = true;
  return true;
};
