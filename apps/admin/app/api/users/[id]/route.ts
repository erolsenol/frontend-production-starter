import { NextResponse } from "next/server";
import { updateUserSchema } from "@repo/validators";
import { userRepository } from "../../../../lib/user-repository";
import { authErrorResponse, requireAdminPermission } from "../../../../lib/access";
import { invalidIdError, noContent, notFoundError, validationError } from "../../../../lib/api-response";
import { getRequestId, isSameOriginMutation, withRequestId } from "../../../../lib/request-context";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = getRequestId(_request);
  if (!isSameOriginMutation(_request)) return withRequestId(NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "Request origin is not allowed." } }, { status: 403 }), requestId);
  try { await requireAdminPermission("users.delete"); } catch (error: unknown) { return withRequestId(authErrorResponse(error), requestId); }
  const { id } = await context.params;
  if (!id) return withRequestId(invalidIdError(), requestId);

  const removed = await userRepository.remove(id);
  if (!removed) return withRequestId(notFoundError(), requestId);
  return withRequestId(noContent(), requestId);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = getRequestId(request);
  if (!isSameOriginMutation(request)) return withRequestId(NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "Request origin is not allowed." } }, { status: 403 }), requestId);
  try { await requireAdminPermission("users.update"); } catch (error: unknown) { return withRequestId(authErrorResponse(error), requestId); }
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
  const updated = await userRepository.update(id, input.data);
  if (!updated) return withRequestId(notFoundError(), requestId);
  return withRequestId(NextResponse.json(updated, { headers: { "cache-control": "no-store" } }), requestId);
}
