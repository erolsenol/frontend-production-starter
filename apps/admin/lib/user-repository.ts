import { InMemoryUserRepository } from "@repo/data-access";
import { getAppConfig } from "@repo/config";
import { users } from "./mock-data";

// This is intentionally disposable demo state. Replace it with a provider-backed repository in production.
const demoRepository = new InMemoryUserRepository(users);

export const getUserRepository = () => {
  const config = getAppConfig(process.env);
  if (!config.demoMode || config.environment === "production") throw new Error("A provider-backed user repository must be configured before production use.");
  return demoRepository;
};
