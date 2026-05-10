import "server-only";
import type { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { logHttp } from "@/lib/logger";

/**
 * Wraps an API route handler with HTTP request/response logging.
 * The handler is expected to catch its own errors and return a NextResponse
 * (e.g. via handleApiError). Uncaught throws are logged at the appropriate
 * status (using ApiError.statusCode when available, 500 otherwise) and re-thrown.
 */
export async function withHttpLogging(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const start = Date.now();
  try {
    const result = await handler();
    logHttp(request.method, request.url, result.status, Date.now() - start);
    return result;
  } catch (error) {
    const status = error instanceof ApiError ? error.statusCode : 500;
    logHttp(request.method, request.url, status, Date.now() - start);
    throw error;
  }
}
