import { InMemoryRoleRepository, type RoleRecord } from "@repo/data-access";
import { allPermissions } from "@repo/permissions";
import { roles } from "./mock-data";

const roleRecords: readonly RoleRecord[] = roles.map((role) => ({
  ...role,
  permissions: role.name === "Administrator" ? allPermissions : role.name === "Viewer" ? ["dashboard.read", "users.read"] : ["dashboard.read", "users.read", "audit_logs.read"],
}));

export const roleRepository = new InMemoryRoleRepository(roleRecords);
