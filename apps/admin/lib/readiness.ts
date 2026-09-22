import { getAppConfig, InvalidProductionConfigError } from "@repo/config";
import { createNeonDatabase, probeNeonDatabase } from "@repo/database";

export interface ReadinessResult { readonly status: "ready" | "not_ready"; readonly checks: { readonly configuration: "ok" | "invalid"; readonly authAdapter: "demo" | "configured" | "not_configured" | "unavailable"; readonly dataAdapter: "memory" | "configured" | "not_configured" | "unavailable" }; }

export const getReadiness = (env: Record<string, string | undefined>): ReadinessResult => {
  try {
    const config = getAppConfig(env);
    if (config.environment === "production") return { status: "not_ready", checks: { configuration: "ok", authAdapter: "not_configured", dataAdapter: "not_configured" } };
    return { status: "ready", checks: { configuration: "ok", authAdapter: "demo", dataAdapter: "memory" } };
  } catch (error: unknown) {
    if (error instanceof InvalidProductionConfigError) return { status: "not_ready", checks: { configuration: "invalid", authAdapter: "not_configured", dataAdapter: "not_configured" } };
    throw error;
  }
};

export const getProductionReadiness = async (env: Record<string, string | undefined>): Promise<ReadinessResult> => {
  const base = getReadiness(env);
  if (base.status === "ready" || env.NODE_ENV !== "production") return base;
  const secret = env.BETTER_AUTH_SECRET;
  const databaseUrl = env.DATABASE_URL;
  const baseURL = env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_APP_URL;
  if (!databaseUrl || !secret || secret.length < 32 || !baseURL) return base;
  try {
    const database = createNeonDatabase(databaseUrl);
    await probeNeonDatabase(database);
    return { status: "ready", checks: { configuration: "ok", authAdapter: "configured", dataAdapter: "configured" } };
  } catch {
    return { status: "not_ready", checks: { configuration: "ok", authAdapter: "configured", dataAdapter: "unavailable" } };
  }
};
