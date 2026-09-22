import { NextResponse } from "next/server";
import { createRoleSchema } from "@repo/validators";
import { allPermissions } from "@repo/permissions";
import { getRoleRepository } from "../../../lib/role-repository";
import { authErrorResponse, requireAdminPermission } from "../../../lib/access";
import { getRequestId, isSameOriginMutation, withRequestId } from "../../../lib/request-context";
import { validationError } from "../../../lib/api-response";
import { recordRequestAudit } from "../../../lib/audit-repository";
import { enforceRateLimit } from "../../../lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  try { await requireAdminPermission("roles.manage", { headers: request.headers }); } catch (error: unknown) { return withRequestId(authErrorResponse(error), requestId); }
  const items = await getRoleRepository().list();
  return withRequestId(NextResponse.json({ items, permissions: allPermissions }, { headers: { "cache-control": "no-store" } }), requestId);
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const rateLimitResponse = await enforceRateLimit(request, "roles.create");
  if (rateLimitResponse) return withRequestId(rateLimitResponse, requestId);
  if (!isSameOriginMutation(request)) return withRequestId(NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "Request origin is not allowed." } }, { status: 403 }), requestId);
  let access;
  try { access = await requireAdminPermission("roles.manage", { headers: request.headers }); } catch (error: unknown) { return withRequestId(authErrorResponse(error), requestId); }
  let body: unknown;
  try { body = await request.json(); } catch { return withRequestId(validationError("Request body must be valid JSON."), requestId); }
  const input = createRoleSchema.safeParse(body);
  if (!input.success) return withRequestId(validationError("Invalid role.", input.error.flatten()), requestId);
  try {
    const role = await getRoleRepository().create(input.data);
    await recordRequestAudit(request, { actorId: access.userId ?? null, action: "role.created", resourceType: "role", resourceId: role.id, requestId });
    return withRequestId(NextResponse.json(role, { status: 201, headers: { "cache-control": "no-store" } }), requestId);
  } catch { return withRequestId(validationError("Role permissions are invalid."), requestId); }
}
