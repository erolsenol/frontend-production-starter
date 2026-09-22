export type Permission =
  | "dashboard.read"
  | "users.read"
  | "users.create"
  | "users.update"
  | "users.delete"
  | "roles.manage"
  | "audit_logs.read"
  | "settings.manage";

export interface AccessContext {
  readonly permissions: readonly Permission[];
}

export const can = (context: AccessContext, permission: Permission): boolean =>
  context.permissions.includes(permission);

export class ForbiddenError extends Error {
  readonly code = "FORBIDDEN" as const;

  constructor(permission: Permission) {
    super(`Missing permission: ${permission}`);
    this.name = "ForbiddenError";
  }
}

export const assertPermission = (context: AccessContext, permission: Permission): void => {
  if (!can(context, permission)) throw new ForbiddenError(permission);
};
