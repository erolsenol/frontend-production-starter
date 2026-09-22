import { NextResponse } from "next/server";
import { updateRoleSchema } from "@repo/validators";
import { roleRepository } from "../../../../lib/role-repository";
import { authErrorResponse, requireAdminPermission } from "../../../../lib/access";
import { getRequestId, isSameOriginMutation, withRequestId } from "../../../../lib/request-context";
import { noContent, notFoundError, validationError } from "../../../../lib/api-response";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const requestId = getRequestId(request);
  if (!isSameOriginMutation(request)) return withRequestId(NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "Request origin is not allowed." } }, { status: 403 }), requestId);
  try { await requireAdminPermission("roles.manage"); } catch (error: unknown) { return withRequestId(authErrorResponse(error), requestId); }
  const { id } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return withRequestId(validationError("Request body must be valid JSON."), requestId); }
  const input = updateRoleSchema.safeParse(body);
  if (!input.success) return withRequestId(validationError("Invalid role update.", input.error.flatten()), requestId);
  try {
    const role = await roleRepository.update(id, input.data);
    return role ? withRequestId(NextResponse.json(role), requestId) : withRequestId(notFoundError(), requestId);
  } catch { return withRequestId(validationError("Role permissions are invalid."), requestId); }
}

export async function DELETE(request: Request, context: Context) {
  const requestId = getRequestId(request);
  if (!isSameOriginMutation(request)) return withRequestId(NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "Request origin is not allowed." } }, { status: 403 }), requestId);
  try { await requireAdminPermission("roles.manage"); } catch (error: unknown) { return withRequestId(authErrorResponse(error), requestId); }
  const removed = await roleRepository.remove((await context.params).id);
  return withRequestId(removed ? noContent() : notFoundError(), requestId);
}
