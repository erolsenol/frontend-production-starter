import { getAppConfig, InvalidProductionConfigError } from "@repo/config";

export interface ReadinessResult { readonly status: "ready" | "not_ready"; readonly checks: { readonly configuration: "ok" | "invalid"; readonly authAdapter: "demo" | "not_configured"; readonly dataAdapter: "memory" | "not_configured" }; }

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
