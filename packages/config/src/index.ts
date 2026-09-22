import { z } from "zod";

const runtimeConfigSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().trim().min(1).max(80).default("Frontend Production Starter"),
  NEXT_PUBLIC_API_URL: z.string().url().or(z.string().startsWith("/")).default("/api"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DEMO_MODE: z.enum(["true", "false"]).default("true"),
  AUTH_PROVIDER: z.string().trim().min(1).default("demo"),
  DATA_SOURCE: z.string().trim().min(1).default("memory"),
});

export type AppEnvironment = "development" | "test" | "production";

export interface AppConfig {
  readonly name: string;
  readonly apiUrl: string;
  readonly environment: AppEnvironment;
  readonly demoMode: boolean;
  readonly authProvider: string;
  readonly dataSource: string;
}

export class InvalidProductionConfigError extends Error {
  readonly code = "INVALID_PRODUCTION_CONFIG" as const;

  constructor(message: string) {
    super(message);
    this.name = "InvalidProductionConfigError";
  }
}

export const getAppConfig = (env: Record<string, string | undefined>): AppConfig => {
  const parsed = runtimeConfigSchema.safeParse(env);
  if (!parsed.success) throw new InvalidProductionConfigError("Application environment is invalid.");

  const config: AppConfig = {
    name: parsed.data.NEXT_PUBLIC_APP_NAME,
    apiUrl: parsed.data.NEXT_PUBLIC_API_URL,
    environment: parsed.data.NODE_ENV,
    demoMode: parsed.data.DEMO_MODE === "true",
    authProvider: parsed.data.AUTH_PROVIDER,
    dataSource: parsed.data.DATA_SOURCE,
  };

  if (config.environment === "production" && (config.demoMode || config.authProvider === "demo" || config.dataSource === "memory")) {
    throw new InvalidProductionConfigError("Production requires a real auth provider, data source, and DEMO_MODE=false.");
  }

  return config;
};
