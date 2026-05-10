import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withHttpLogging } from "@/lib/api-wrapper";
import { logError } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/services/prisma";

// Public readiness probe — intentionally unauthenticated so deployment
// orchestration (Vercel, uptime checks, CI) can hit it without credentials.
// Rate-limited to mitigate trivial abuse. Verifies database connectivity so a
// 200 response is a real signal that the deployment can serve traffic.
export async function GET(request: NextRequest) {
  return withHttpLogging(request, async () => {
    const limited = await checkRateLimit(request, { id: "api/health", limit: 60, windowSecs: 60 });
    if (limited) return limited;

    const timestamp = new Date().toISOString();

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      logError("Health check failed: database unreachable", error);
      return NextResponse.json(
        { status: "error", database: "down", timestamp },
        { status: 503 }
      );
    }

    return NextResponse.json({ status: "ok", database: "up", timestamp });
  });
}
