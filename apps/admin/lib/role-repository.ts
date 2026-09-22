import { InMemoryRoleRepository, type RoleRecord, type RoleRepository } from "@repo/data-access";
import { getAppConfig } from "@repo/config";
import { allPermissions } from "@repo/permissions";
import { roles } from "./mock-data";

const roleRecords: readonly RoleRecord[] = roles.map((role) => ({
  ...role,
  permissions: role.name === "Administrator" ? allPermissions : role.name === "Viewer" ? ["dashboard.read", "users.read"] : ["dashboard.read", "users.read", "audit_logs.read"],
}));

const demoRepository = new InMemoryRoleRepository(roleRecords);
let configuredRepository: RoleRepository | null = null;

export const configureRoleRepository = (repository: RoleRepository | null): void => { configuredRepository = repository; };

export const getRoleRepository = () => {
  const config = getAppConfig(process.env);
  if (!config.demoMode || config.environment === "production") {
    if (!configuredRepository) throw new Error("A provider-backed role repository must be configured before production use.");
    return configuredRepository;
  }
  return demoRepository;
};
