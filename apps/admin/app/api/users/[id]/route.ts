import { NextResponse } from "next/server";
import { updateUserSchema } from "@repo/validators";
import { userRepository } from "../../../../lib/user-repository";
import { authErrorResponse, requireAdminPermission } from "../../../../lib/access";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try { await requireAdminPermission("users.delete"); } catch (error: unknown) { return authErrorResponse(error); }
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: { code: "INVALID_ID", message: "User id is required." } }, { status: 400 });

  const removed = await userRepository.remove(id);
  if (!removed) return NextResponse.json({ error: { code: "NOT_FOUND", message: "User not found." } }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try { await requireAdminPermission("users.update"); } catch (error: unknown) { return authErrorResponse(error); }
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: { code: "INVALID_ID", message: "User id is required." } }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Request body must be valid JSON." } }, { status: 422 });
  }

  const input = updateUserSchema.safeParse(body);
  if (!input.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid user update.", details: input.error.flatten() } }, { status: 422 });
  const updated = await userRepository.update(id, input.data);
  if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "User not found." } }, { status: 404 });
  return NextResponse.json(updated, { headers: { "cache-control": "no-store" } });
}
