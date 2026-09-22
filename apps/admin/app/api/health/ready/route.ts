import { NextResponse } from "next/server";
import { getProductionReadiness } from "../../../../lib/readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness = await getProductionReadiness(process.env);
  return NextResponse.json({ ...readiness, service: "admin", timestamp: new Date().toISOString() }, { status: readiness.status === "ready" ? 200 : 503, headers: { "cache-control": "no-store" } });
}
