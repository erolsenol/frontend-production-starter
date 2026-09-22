import { InMemoryUserRepository, type UserRepository } from "@repo/data-access";
import { getAppConfig } from "@repo/config";
import { users } from "./mock-data";

// This is intentionally disposable demo state. Replace it with a provider-backed repository in production.
const demoRepository = new InMemoryUserRepository(users);
let configuredRepository: UserRepository | null = null;

export const configureUserRepository = (repository: UserRepository | null): void => { configuredRepository = repository; };

export const getUserRepository = () => {
  const config = getAppConfig(process.env);
  if (!config.demoMode || config.environment === "production") {
    if (!configuredRepository) throw new Error("A provider-backed user repository must be configured before production use.");
    return configuredRepository;
  }
  return demoRepository;
};
