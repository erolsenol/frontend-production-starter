import { InMemoryUserRepository } from "@repo/data-access";
import { users } from "./mock-data";

// This is intentionally disposable demo state. Replace it with a provider-backed repository in production.
export const userRepository = new InMemoryUserRepository(users);
