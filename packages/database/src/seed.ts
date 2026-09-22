import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { allPermissions } from "@repo/permissions";
import { permissions, rolePermissions, roles } from "./index";
import type { databaseSchema } from "./index";

type Database = NeonHttpDatabase<typeof databaseSchema>;
const descriptions: Readonly<Record<string, string>> = { "dashboard.read": "View the dashboard", "users.read": "View users", "users.create": "Invite users", "users.update": "Update users", "users.delete": "Delete users", "roles.manage": "Manage roles and permissions", "audit_logs.read": "View audit logs", "settings.manage": "Manage workspace settings" };

export const seedReferenceRbac = async (db: Database): Promise<void> => {
  await db.insert(permissions).values(allPermissions.map((key) => ({ key, description: descriptions[key] ?? key }))).onConflictDoNothing();
  const referenceRoles = [{ id: "role_admin", name: "Administrator", description: "Full access to the workspace", system: true }, { id: "role_viewer", name: "Viewer", description: "Read-only workspace access", system: true }];
  await db.insert(roles).values(referenceRoles).onConflictDoNothing();
  await db.insert(rolePermissions).values(allPermissions.map((permissionKey) => ({ roleId: "role_admin", permissionKey }))).onConflictDoNothing();
  await db.insert(rolePermissions).values(["dashboard.read", "users.read"].map((permissionKey) => ({ roleId: "role_viewer", permissionKey }))).onConflictDoNothing();
};
