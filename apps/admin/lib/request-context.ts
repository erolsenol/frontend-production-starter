import { randomUUID } from "node:crypto";
const requestIdPattern = /^[A-Za-z0-9._-]{1,80}$/;
export const getRequestId = (request: Request): string => { const candidate = request.headers.get("x-request-id"); return candidate && requestIdPattern.test(candidate) ? candidate : randomUUID(); };
export const withRequestId = (response: Response, requestId: string): Response => { response.headers.set("x-request-id", requestId); return response; };
export const isSameOriginMutation = (request: Request): boolean => { const origin = request.headers.get("origin"); return !origin || origin === new URL(request.url).origin; };
