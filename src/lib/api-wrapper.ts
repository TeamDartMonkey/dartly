import "server-only";
import type { NextRequest, NextResponse } from "next/server";
import { logHttp } from "@/lib/logger";

/**
 * Wraps an API route handler with HTTP request/response logging.
 * The handler is expected to catch its own errors and return a NextResponse
 * (e.g. via handleApiError). Uncaught throws are logged as 500 and re-thrown.
 */
// Wraps route handlers to automatically log all HTTP requests.
// Measures duration from request start to response completion.
// Logs successful responses with actual status, errors as 500.
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
    logHttp(request.method, request.url, 500, Date.now() - start);
    throw error;
  }
}
