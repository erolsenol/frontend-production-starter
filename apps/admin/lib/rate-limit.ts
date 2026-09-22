import { NextResponse } from "next/server";
import { createUpstashRateLimiter, type RateLimiter } from "@repo/rate-limit-upstash";

let limiter: RateLimiter | null | undefined;
const getLimiter = (): RateLimiter | null => {
  if (limiter !== undefined) return limiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  limiter = url && token ? createUpstashRateLimiter({ url, token, requests: 60, window: "1 m" }) : null;
  return limiter;
};

export const enforceRateLimit = async (request: Request, scope: string): Promise<Response | null> => {
  if (process.env.NODE_ENV !== "production" && process.env.DEMO_MODE !== "false") return null;
  const configuredLimiter = getLimiter();
  if (!configuredLimiter) return NextResponse.json({ error: { code: "RATE_LIMIT_NOT_CONFIGURED", message: "Rate limiting is not configured." } }, { status: 503 });
  const identifier = `${scope}:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"}`;
  const result = await configuredLimiter.limit(identifier);
  if (result.success) return null;
  return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Too many requests. Try again later." } }, { status: 429, headers: { "retry-after": String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))), "x-ratelimit-limit": String(result.limit), "x-ratelimit-remaining": String(result.remaining) } });
};
