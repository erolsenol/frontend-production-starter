import { NextResponse } from "next/server";
import { updateRoleSchema } from "@repo/validators";
import { getRoleRepository } from "../../../../lib/role-repository";
import { authErrorResponse, requireAdminPermission } from "../../../../lib/access";
import { getRequestId, isSameOriginMutation, withRequestId } from "../../../../lib/request-context";
import { noContent, notFoundError, validationError } from "../../../../lib/api-response";
import { recordRequestAudit } from "../../../../lib/audit-repository";
import { enforceRateLimit } from "../../../../lib/rate-limit";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const requestId = getRequestId(request);
  const rateLimitResponse = await enforceRateLimit(request, "roles.update");
  if (rateLimitResponse) return withRequestId(rateLimitResponse, requestId);
  if (!isSameOriginMutation(request)) return withRequestId(NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "Request origin is not allowed." } }, { status: 403 }), requestId);
  let access;
  try { access = await requireAdminPermission("roles.manage", { headers: request.headers }); } catch (error: unknown) { return withRequestId(authErrorResponse(error), requestId); }
  const { id } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return withRequestId(validationError("Request body must be valid JSON."), requestId); }
  const input = updateRoleSchema.safeParse(body);
  if (!input.success) return withRequestId(validationError("Invalid role update.", input.error.flatten()), requestId);
  try {
    const role = await getRoleRepository().update(id, input.data);
    if (role) await recordRequestAudit(request, { actorId: access.userId ?? null, action: "role.updated", resourceType: "role", resourceId: id, requestId });
    return role ? withRequestId(NextResponse.json(role), requestId) : withRequestId(notFoundError(), requestId);
  } catch { return withRequestId(validationError("Role permissions are invalid."), requestId); }
}

export async function DELETE(request: Request, context: Context) {
  const requestId = getRequestId(request);
  const rateLimitResponse = await enforceRateLimit(request, "roles.delete");
  if (rateLimitResponse) return withRequestId(rateLimitResponse, requestId);
  if (!isSameOriginMutation(request)) return withRequestId(NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "Request origin is not allowed." } }, { status: 403 }), requestId);
  let access;
  try { access = await requireAdminPermission("roles.manage", { headers: request.headers }); } catch (error: unknown) { return withRequestId(authErrorResponse(error), requestId); }
  const { id } = await context.params;
  const removed = await getRoleRepository().remove(id);
  if (removed) await recordRequestAudit(request, { actorId: access.userId ?? null, action: "role.deleted", resourceType: "role", resourceId: id, requestId });
  return withRequestId(removed ? noContent() : notFoundError(), requestId);
}
