import { NextResponse } from "next/server";
import { createDemoAuthAdapter, requireSession, UnauthenticatedError, type AuthAdapter } from "@repo/auth";
import { assertPermission, ForbiddenError, type AccessContext, type Permission } from "@repo/permissions";
import { getAppConfig, InvalidProductionConfigError } from "@repo/config";

const demoPermissions: readonly Permission[] = [
  "dashboard.read", "users.read", "users.create", "users.update", "users.delete", "roles.manage", "audit_logs.read", "settings.manage",
];

export interface AdminAccessDependencies {
  readonly auth: AuthAdapter;
  readonly permissions: readonly Permission[];
}

export const createAdminPermissionGuard = ({ auth, permissions }: AdminAccessDependencies) => async (permission: Permission): Promise<AccessContext> => {
  await requireSession(auth);
  const context: AccessContext = { permissions };
  assertPermission(context, permission);
  return context;
};

const demoPermissionGuard = createAdminPermissionGuard({ auth: createDemoAuthAdapter(), permissions: demoPermissions });
let configuredPermissionGuard: ((permission: Permission) => Promise<AccessContext>) | null = null;

export const configureAdminAccess = (dependencies: AdminAccessDependencies | null): void => {
  configuredPermissionGuard = dependencies ? createAdminPermissionGuard(dependencies) : null;
};

export const requireAdminPermission = async (permission: Permission): Promise<AccessContext> => {
  let config;
  try {
    config = getAppConfig(process.env);
  } catch (error: unknown) {
    if (error instanceof InvalidProductionConfigError) throw new UnauthenticatedError();
    throw error;
  }
  if (config.demoMode && config.environment !== "production") return demoPermissionGuard(permission);
  if (!configuredPermissionGuard) throw new UnauthenticatedError();
  return configuredPermissionGuard(permission);
};

export const authErrorResponse = (error: unknown): NextResponse => {
  if (error instanceof ForbiddenError) return NextResponse.json({ error: { code: error.code, message: "You do not have permission to perform this action." } }, { status: 403 });
  if (error instanceof UnauthenticatedError) return NextResponse.json({ error: { code: error.code, message: "Authentication is required." } }, { status: 401 });
  return NextResponse.json({ error: { code: "AUTH_ERROR", message: "Authentication could not be verified." } }, { status: 401 });
};
