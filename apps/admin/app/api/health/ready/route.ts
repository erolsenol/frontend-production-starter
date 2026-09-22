import { NextResponse } from "next/server";
import { getReadiness } from "../../../../lib/readiness";

export const dynamic = "force-dynamic";

export function GET() {
  const readiness = getReadiness(process.env);
  return NextResponse.json({ ...readiness, service: "admin", timestamp: new Date().toISOString() }, { status: readiness.status === "ready" ? 200 : 503, headers: { "cache-control": "no-store" } });
}
