import { NextResponse } from "next/server";
import { updateUserSchema } from "@repo/validators";
import { userRepository } from "../../../../lib/user-repository";
import { authErrorResponse, requireAdminPermission } from "../../../../lib/access";
import { invalidIdError, noContent, notFoundError, validationError } from "../../../../lib/api-response";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try { await requireAdminPermission("users.delete"); } catch (error: unknown) { return authErrorResponse(error); }
  const { id } = await context.params;
  if (!id) return invalidIdError();

  const removed = await userRepository.remove(id);
  if (!removed) return notFoundError();
  return noContent();
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try { await requireAdminPermission("users.update"); } catch (error: unknown) { return authErrorResponse(error); }
  const { id } = await context.params;
  if (!id) return invalidIdError();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationError("Request body must be valid JSON.");
  }

  const input = updateUserSchema.safeParse(body);
  if (!input.success) return validationError("Invalid user update.", input.error.flatten());
  const updated = await userRepository.update(id, input.data);
  if (!updated) return notFoundError();
  return NextResponse.json(updated, { headers: { "cache-control": "no-store" } });
}
