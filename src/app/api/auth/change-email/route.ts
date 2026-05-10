import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { ApiError, handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/requireAuth";
import { createClient } from "@/lib/supabase-server";
import { validateBody } from "@/lib/validate-body";

export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
    const limited = await checkRateLimit(request, {
      id: "api/auth/change-email",
      limit: 3,
      windowSecs: 300,
    });
    if (limited) return limited;

    try {
      const user = await requireAuth();
      const { email } = await validateBody(request, z.object({ email: z.email() }));

      const supabase = await createClient();
      const { error } = await supabase.auth.updateUser({ email });

      if (error) {
        // Surface a user-actionable 400 with the Supabase message rather than
        // a generic 500. Logged for diagnosis.
        logger.warn("Change-email failed", { userId: user.id, message: error.message });
        throw new ApiError(400, error.message);
      }

      logger.info("Email change requested", { userId: user.id });
      return NextResponse.json({ message: "Confirmation email sent" }, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
