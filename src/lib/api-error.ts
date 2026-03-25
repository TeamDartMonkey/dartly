import "server-only";
import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";

// Custom error class that pairs HTTP status codes with messages.
// Allows throwing typed errors with specific status codes from routes.
// Public readonly properties enable structured error handling.
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Factory function for consistent error response format.
// All API errors follow { error: string } structure.
export function createErrorResponse(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown): NextResponse {
  // Unknown errors are logged for debugging but not exposed to clients
  // to prevent information leakage. Returns generic 500 message.
  if (error instanceof ApiError) {
    return createErrorResponse(error.statusCode, error.message);
  }
  logError("Unhandled API error", error);
  return createErrorResponse(500, "Internal server error");
}
