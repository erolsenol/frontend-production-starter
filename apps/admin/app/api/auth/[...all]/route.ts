import { toNextJsHandler } from "better-auth/next-js";
import { createBetterAuth } from "@repo/auth/better-auth";
import { createNeonDatabase } from "@repo/database";
import { enforceRateLimit } from "../../../../lib/rate-limit";
import { getRequestId, withRequestId } from "../../../../lib/request-context";
import { instrumentRequest } from "../../../../lib/telemetry";

export const dynamic = "force-dynamic";

const getHandlers = () => {
  const databaseUrl = process.env.DATABASE_URL;
  const secret = process.env.BETTER_AUTH_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!databaseUrl || !secret || !baseURL) throw new Error("DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL are required for Better Auth.");
  return toNextJsHandler(createBetterAuth(createNeonDatabase(databaseUrl), { secret, baseURL, trustedOrigins: [baseURL] }));
};

export async function GET(request: Request) { return instrumentRequest(request, () => getHandlers().GET(request)); }
export async function POST(request: Request) {
  const requestId = getRequestId(request);
  return instrumentRequest(request, async () => {
    const rateLimitResponse = await enforceRateLimit(request, "auth");
    if (rateLimitResponse) return withRequestId(rateLimitResponse, requestId);
    return withRequestId(await getHandlers().POST(request), requestId);
  });
}
