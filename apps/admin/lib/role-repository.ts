import { InMemoryRoleRepository, type RoleRecord } from "@repo/data-access";
import { getAppConfig } from "@repo/config";
import { allPermissions } from "@repo/permissions";
import { roles } from "./mock-data";

const roleRecords: readonly RoleRecord[] = roles.map((role) => ({
  ...role,
  permissions: role.name === "Administrator" ? allPermissions : role.name === "Viewer" ? ["dashboard.read", "users.read"] : ["dashboard.read", "users.read", "audit_logs.read"],
}));

const demoRepository = new InMemoryRoleRepository(roleRecords);

export const getRoleRepository = () => {
  const config = getAppConfig(process.env);
  if (!config.demoMode || config.environment === "production") throw new Error("A provider-backed role repository must be configured before production use.");
  return demoRepository;
};
