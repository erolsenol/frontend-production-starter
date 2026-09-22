import { NextResponse } from "next/server";

export const validationError = (message: string, details?: unknown): NextResponse =>
  NextResponse.json({ error: { code: "VALIDATION_ERROR", message, ...(details === undefined ? {} : { details }) } }, { status: 422 });

export const invalidIdError = (): NextResponse =>
  NextResponse.json({ error: { code: "INVALID_ID", message: "User id is required." } }, { status: 400 });

export const notFoundError = (): NextResponse =>
  NextResponse.json({ error: { code: "NOT_FOUND", message: "User not found." } }, { status: 404 });

export const noContent = (): NextResponse => new NextResponse(null, { status: 204 });
