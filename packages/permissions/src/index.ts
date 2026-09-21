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
