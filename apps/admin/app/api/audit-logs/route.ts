import { NextResponse } from "next/server";
import { paginationSchema } from "@repo/validators";
import { authErrorResponse, requireAdminPermission } from "../../../lib/access";
import { getAuditRepository } from "../../../lib/audit-repository";
import { getRequestId, withRequestId } from "../../../lib/request-context";
import { validationError } from "../../../lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  try { await requireAdminPermission("audit_logs.read", { headers: request.headers }); } catch (error: unknown) { return withRequestId(authErrorResponse(error), requestId); }
  const url = new URL(request.url);
  const pagination = paginationSchema.safeParse({ page: url.searchParams.get("page") ?? 1, pageSize: url.searchParams.get("pageSize") ?? 20 });
  if (!pagination.success) return withRequestId(validationError("Invalid audit log pagination.", pagination.error.flatten()), requestId);
  return withRequestId(NextResponse.json(await getAuditRepository().list(pagination.data), { headers: { "cache-control": "no-store" } }), requestId);
}
