import { NextResponse } from "next/server";
import { updateUserSchema } from "@repo/validators";
import { getUserRepository } from "../../../../lib/user-repository";
import { authErrorResponse, requireAdminPermission } from "../../../../lib/access";
import { invalidIdError, noContent, notFoundError, validationError } from "../../../../lib/api-response";
import { getRequestId, isSameOriginMutation, withRequestId } from "../../../../lib/request-context";
import { recordRequestAudit } from "../../../../lib/audit-repository";
import { enforceRateLimit } from "../../../../lib/rate-limit";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = getRequestId(_request);
  const rateLimitResponse = await enforceRateLimit(_request, "users.delete");
  if (rateLimitResponse) return withRequestId(rateLimitResponse, requestId);
  if (!isSameOriginMutation(_request)) return withRequestId(NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "Request origin is not allowed." } }, { status: 403 }), requestId);
  let access;
  try { access = await requireAdminPermission("users.delete", { headers: _request.headers }); } catch (error: unknown) { return withRequestId(authErrorResponse(error), requestId); }
  const { id } = await context.params;
  if (!id) return withRequestId(invalidIdError(), requestId);

  const removed = await getUserRepository().remove(id);
  if (!removed) return withRequestId(notFoundError(), requestId);
  await recordRequestAudit(_request, { actorId: access.userId ?? null, action: "user.deleted", resourceType: "user", resourceId: id, requestId });
  return withRequestId(noContent(), requestId);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = getRequestId(request);
  const rateLimitResponse = await enforceRateLimit(request, "users.update");
  if (rateLimitResponse) return withRequestId(rateLimitResponse, requestId);
  if (!isSameOriginMutation(request)) return withRequestId(NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "Request origin is not allowed." } }, { status: 403 }), requestId);
  let access;
  try { access = await requireAdminPermission("users.update", { headers: request.headers }); } catch (error: unknown) { return withRequestId(authErrorResponse(error), requestId); }
  const { id } = await context.params;
  if (!id) return withRequestId(invalidIdError(), requestId);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withRequestId(validationError("Request body must be valid JSON."), requestId);
  }

  const input = updateUserSchema.safeParse(body);
  if (!input.success) return withRequestId(validationError("Invalid user update.", input.error.flatten()), requestId);
  const updated = await getUserRepository().update(id, input.data);
  if (!updated) return withRequestId(notFoundError(), requestId);
  await recordRequestAudit(request, { actorId: access.userId ?? null, action: "user.updated", resourceType: "user", resourceId: id, requestId });
  return withRequestId(NextResponse.json(updated, { headers: { "cache-control": "no-store" } }), requestId);
}
