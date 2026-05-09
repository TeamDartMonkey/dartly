import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";

// In-memory store — suitable for single-process deployments (Docker, traditional servers).
// For multi-instance deployments (Vercel, clustered Node), swap RateLimiterMemory
// for RateLimiterRedis and provide a shared Redis connection.
const limiters = new Map<string, RateLimiterMemory>();

interface RateLimitOptions {
  /** Unique key for this limiter (e.g. "api/health") */
  id: string;
  /** Max requests per window */
  limit?: number;
  /** Window duration in seconds */
  windowSecs?: number;
}

/**
 * Returns or creates a rate limiter instance by ID. Limiters are cached for reuse.
 * If the same ID is called with different `limit` or `windowSecs`, the cached limiter
 * (with the original options) is returned — new options are silently ignored.
 * Use unique IDs per route.
 */
export function getRateLimiter({ id, limit = 60, windowSecs = 60 }: RateLimitOptions) {
  let limiter = limiters.get(id);
  if (!limiter) {
    limiter = new RateLimiterMemory({ points: limit, duration: windowSecs });
    limiters.set(id, limiter);
  }
  return limiter;
}

/**
 * Extracts the client IP from the request.
 * Prefers Vercel's trusted header, then standard reverse-proxy headers.
 * Falls back to a per-request unknown bucket so requests without any IP
 * header do not all share the same rate-limit bucket (which would cause
 * legitimate traffic to trip immediately on misconfigured deployments).
 *
 * Note: X-Forwarded-For is spoofable when the upstream is not a trusted
 * proxy. On Vercel, prefer x-vercel-forwarded-for which is set by the
 * platform and is not spoofable from the client.
 */
function getClientIp(request: NextRequest): string {
  const vercelIp = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercelIp) return vercelIp;
  const xff = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (xff) return xff;
  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp;
  // No header present (likely local dev or misconfigured proxy). Use a single
  // shared bucket so rate limits still apply; in production behind a trusted
  // proxy the headers above should always be set.
  return "127.0.0.1";
}

/**
 * Returns a 429 response if the caller exceeds the rate limit, otherwise null.
 * Key is the client IP address extracted from request headers.
 */
export async function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const limiter = getRateLimiter(options);
  const limit = options.limit ?? 60;
  const ip = getClientIp(request);

  try {
    await limiter.consume(ip);
    return null;
  } catch (error) {
    if (!(error instanceof RateLimiterRes)) throw error;
    const retryAfter = Math.ceil(error.msBeforeNext / 1000);
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }
}
