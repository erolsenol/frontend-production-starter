import { NextResponse } from "next/server";
import { paginationSchema, inviteUserSchema, userFilterSchema } from "@repo/validators";
import { userRepository } from "../../../lib/user-repository";
import { authErrorResponse, requireAdminPermission } from "../../../lib/access";
import { validationError } from "../../../lib/api-response";
import { getRequestId, isSameOriginMutation, withRequestId } from "../../../lib/request-context";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  try { await requireAdminPermission("users.read"); } catch (error: unknown) { return withRequestId(authErrorResponse(error), requestId); }
  const url = new URL(request.url);
  const filter = userFilterSchema.safeParse({ query: url.searchParams.get("query") ?? "", status: url.searchParams.get("status") ?? "all" });
  const pagination = paginationSchema.safeParse({ page: url.searchParams.get("page") ?? 1, pageSize: url.searchParams.get("pageSize") ?? 20 });

  if (!filter.success || !pagination.success) {
    return withRequestId(validationError("Invalid user filters.", {
      filter: filter.success ? undefined : filter.error.flatten(),
      pagination: pagination.success ? undefined : pagination.error.flatten(),
    }), requestId);
  }

  const result = await userRepository.list({ ...filter.data, ...pagination.data });
  return withRequestId(NextResponse.json(result, { headers: { "cache-control": "no-store" } }), requestId);
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  if (!isSameOriginMutation(request)) return withRequestId(NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "Request origin is not allowed." } }, { status: 403 }), requestId);
  try { await requireAdminPermission("users.create"); } catch (error: unknown) { return withRequestId(authErrorResponse(error), requestId); }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withRequestId(validationError("Request body must be valid JSON."), requestId);
  }

  const input = inviteUserSchema.safeParse(body);
  if (!input.success) return withRequestId(validationError("Invalid user invitation.", input.error.flatten()), requestId);

  const user = await userRepository.create(input.data);
  return withRequestId(NextResponse.json(user, { status: 201, headers: { "cache-control": "no-store" } }), requestId);
}
