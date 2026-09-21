export interface AppConfig { readonly name: string; readonly apiUrl: string; readonly environment: "development" | "test" | "production"; }

export const getAppConfig = (env: Record<string, string | undefined>): AppConfig => ({
  name: env.NEXT_PUBLIC_APP_NAME ?? "Frontend Production Starter",
  apiUrl: env.NEXT_PUBLIC_API_URL ?? "/api",
  environment: env.NODE_ENV === "production" ? "production" : env.NODE_ENV === "test" ? "test" : "development",
});
