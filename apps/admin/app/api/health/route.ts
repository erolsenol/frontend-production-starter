import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "admin",
    version: process.env.npm_package_version ?? "0.8.0",
    timestamp: new Date().toISOString(),
  });
}
