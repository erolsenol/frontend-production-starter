import { NextResponse } from "next/server";
import { createDemoAuthAdapter, requireSession, UnauthenticatedError, type AuthAdapter, type AuthContext } from "@repo/auth";
import { assertPermission, ForbiddenError, type AccessContext, type Permission } from "@repo/permissions";
import { getAppConfig, InvalidProductionConfigError } from "@repo/config";

const demoPermissions: readonly Permission[] = [
  "dashboard.read", "users.read", "users.create", "users.update", "users.delete", "roles.manage", "audit_logs.read", "settings.manage",
];

export interface AdminAccessDependencies {
  readonly auth: AuthAdapter;
  readonly permissions: readonly Permission[] | ((userId: string) => Promise<readonly Permission[]>);
}

export const createAdminPermissionGuard = ({ auth, permissions }: AdminAccessDependencies) => async (permission: Permission, context?: AuthContext): Promise<AccessContext> => {
  const session = await requireSession(auth, context);
  const resolvedPermissions = typeof permissions === "function" ? await permissions(session.userId) : permissions;
  const accessContext: AccessContext = { permissions: resolvedPermissions, userId: session.userId };
  assertPermission(accessContext, permission);
  return accessContext;
};

const demoPermissionGuard = createAdminPermissionGuard({ auth: createDemoAuthAdapter(), permissions: demoPermissions });
let configuredPermissionGuard: ((permission: Permission, context?: AuthContext) => Promise<AccessContext>) | null = null;

export const configureAdminAccess = (dependencies: AdminAccessDependencies | null): void => {
  configuredPermissionGuard = dependencies ? createAdminPermissionGuard(dependencies) : null;
};

export const requireAdminPermission = async (permission: Permission, context?: AuthContext): Promise<AccessContext> => {
  let config;
  try {
    config = getAppConfig(process.env);
  } catch (error: unknown) {
    if (error instanceof InvalidProductionConfigError) throw new UnauthenticatedError();
    throw error;
  }
  if (config.demoMode && config.environment !== "production") return demoPermissionGuard(permission, context);
  if (!configuredPermissionGuard) {
    const composition = await import("./production-composition");
    composition.ensureProductionComposition();
  }
  if (!configuredPermissionGuard) throw new UnauthenticatedError();
  return configuredPermissionGuard(permission, context);
};

export const authErrorResponse = (error: unknown): NextResponse => {
  if (error instanceof ForbiddenError) return NextResponse.json({ error: { code: error.code, message: "You do not have permission to perform this action." } }, { status: 403 });
  if (error instanceof UnauthenticatedError) return NextResponse.json({ error: { code: error.code, message: "Authentication is required." } }, { status: 401 });
  return NextResponse.json({ error: { code: "AUTH_ERROR", message: "Authentication could not be verified." } }, { status: 401 });
};
