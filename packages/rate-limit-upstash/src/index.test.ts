import { describe, expect, it } from "vitest";
import { createUpstashRateLimiter } from "./index";
describe("Upstash rate limiter", () => { it("creates a server-side limiter without contacting Redis during construction", () => { expect(createUpstashRateLimiter({ url: "https://example.com", token: "server-only", requests: 10, window: "1 m" })).toBeDefined(); }); });
