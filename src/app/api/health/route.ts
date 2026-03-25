import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withHttpLogging } from "@/lib/api-wrapper";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  return withHttpLogging(request, async () => {
    const limited = await checkRateLimit(request, { id: "api/health", limit: 60, windowSecs: 60 });
    if (limited) return limited;

    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
  });
}
