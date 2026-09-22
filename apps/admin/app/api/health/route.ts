import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "admin",
    version: process.env.npm_package_version ?? "0.10.0",
    timestamp: new Date().toISOString(),
  }, { headers: { "cache-control": "no-store" } });
}
