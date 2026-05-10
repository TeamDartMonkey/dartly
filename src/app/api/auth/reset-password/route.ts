import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { ApiError, handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import { env } from "@/lib/env";
import logger from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase-server";
import { validateBody } from "@/lib/validate-body";

// Public endpoint — users requesting a reset are by definition not signed in.
// Rate-limited per IP to mitigate trivial spam of reset emails to arbitrary
// addresses. The redirectTo URL is sourced from validated env (NEXT_PUBLIC_APP_URL)
// so a missing/malformed env value cannot be exploited for open-redirect.
export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
    const limited = await checkRateLimit(request, {
      id: "api/auth/reset-password",
      limit: 5,
      windowSecs: 300,
    });
    if (limited) return limited;

    try {
      const { email } = await validateBody(request, z.object({ email: z.email() }));

      if (!env.NEXT_PUBLIC_APP_URL) {
        throw new ApiError(500, "Reset link cannot be constructed");
      }

      const supabase = await createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${env.NEXT_PUBLIC_APP_URL}/reset-password`,
      });

      if (error) {
        // Log internally but always return success to avoid leaking which
        // emails are registered (account-enumeration defense).
        logger.warn("Password reset request failed", { message: error.message });
      } else {
        logger.info("Password reset requested");
      }

      return NextResponse.json({ message: "If that account exists, a reset email was sent." });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
