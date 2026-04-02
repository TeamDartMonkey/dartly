import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { logoutUser } from "@/services/auth";

export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
    //rate limit of 10 per min per IP
    const rateLimitResponse = await checkRateLimit(request, {
      id: "api/auth/logout",
      limit: 10,
      windowSecs: 60,
    });

    if (rateLimitResponse) return rateLimitResponse;

    try {
      await logoutUser();
      logger.info("User logged out");
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
