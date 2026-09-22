import { NextResponse } from "next/server";
import { createDemoAuthAdapter, requireSession, UnauthenticatedError } from "@repo/auth";
import { assertPermission, ForbiddenError, type AccessContext, type Permission } from "@repo/permissions";

const demoPermissions: readonly Permission[] = [
  "dashboard.read", "users.read", "users.create", "users.update", "users.delete", "roles.manage", "audit_logs.read", "settings.manage",
];

export const requireAdminPermission = async (permission: Permission): Promise<AccessContext> => {
  if (process.env.NODE_ENV === "production" || process.env.DEMO_MODE === "false") throw new UnauthenticatedError();
  await requireSession(createDemoAuthAdapter());
  const context: AccessContext = { permissions: demoPermissions };
  assertPermission(context, permission);
  return context;
};

export const authErrorResponse = (error: unknown): NextResponse => {
  if (error instanceof ForbiddenError) return NextResponse.json({ error: { code: error.code, message: "You do not have permission to perform this action." } }, { status: 403 });
  if (error instanceof UnauthenticatedError) return NextResponse.json({ error: { code: error.code, message: "Authentication is required." } }, { status: 401 });
  return NextResponse.json({ error: { code: "AUTH_ERROR", message: "Authentication could not be verified." } }, { status: 401 });
};
