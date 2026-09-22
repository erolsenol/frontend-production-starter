import { NextResponse } from "next/server";
import { userRepository } from "../../../../lib/user-repository";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: { code: "INVALID_ID", message: "User id is required." } }, { status: 400 });

  const removed = await userRepository.remove(id);
  if (!removed) return NextResponse.json({ error: { code: "NOT_FOUND", message: "User not found." } }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
