import { createTelemetry } from "@repo/observability";

const telemetry = createTelemetry("frontend-production-starter-admin");

export const instrumentRequest = async (request: Request, handler: () => Promise<Response>): Promise<Response> => {
  const startedAt = performance.now();
  const response = await handler();
  telemetry.recordRequest({ requestId: request.headers.get("x-request-id") ?? "generated", route: new URL(request.url).pathname, method: request.method, status: response.status, durationMs: performance.now() - startedAt });
  return response;
};
