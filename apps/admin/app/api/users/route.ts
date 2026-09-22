import { NextResponse } from "next/server";
import { paginationSchema, inviteUserSchema, userFilterSchema } from "@repo/validators";
import { userRepository } from "../../../lib/user-repository";
import { authErrorResponse, requireAdminPermission } from "../../../lib/access";
import { validationError } from "../../../lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try { await requireAdminPermission("users.read"); } catch (error: unknown) { return authErrorResponse(error); }
  const url = new URL(request.url);
  const filter = userFilterSchema.safeParse({ query: url.searchParams.get("query") ?? "", status: url.searchParams.get("status") ?? "all" });
  const pagination = paginationSchema.safeParse({ page: url.searchParams.get("page") ?? 1, pageSize: url.searchParams.get("pageSize") ?? 20 });

  if (!filter.success || !pagination.success) {
    return validationError("Invalid user filters.", {
      filter: filter.success ? undefined : filter.error.flatten(),
      pagination: pagination.success ? undefined : pagination.error.flatten(),
    });
  }

  const result = await userRepository.list({ ...filter.data, ...pagination.data });
  return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  try { await requireAdminPermission("users.create"); } catch (error: unknown) { return authErrorResponse(error); }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationError("Request body must be valid JSON.");
  }

  const input = inviteUserSchema.safeParse(body);
  if (!input.success) return validationError("Invalid user invitation.", input.error.flatten());

  const user = await userRepository.create(input.data);
  return NextResponse.json(user, { status: 201, headers: { "cache-control": "no-store" } });
}
