import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult { readonly success: boolean; readonly limit: number; readonly remaining: number; readonly reset: number; }
export interface RateLimiter { limit(identifier: string): Promise<RateLimitResult>; }
export const createUpstashRateLimiter = (input: { readonly url: string; readonly token: string; readonly requests: number; readonly window: `${number} s` | `${number} m` | `${number} h` }): RateLimiter => {
  const limiter = new Ratelimit({ redis: new Redis({ url: input.url, token: input.token }), limiter: Ratelimit.slidingWindow(input.requests, input.window), analytics: true });
  return { limit: async (identifier) => limiter.limit(identifier) };
};
