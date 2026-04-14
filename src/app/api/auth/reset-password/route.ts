import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { createClient } from "@/lib/supabase-server";
import { validateBody } from "@/lib/validate-body";

export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { email } = await validateBody(request, z.object({ email: z.email() }));

      const supabase = await createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      logger.info("Password reset requested", { userId: user.id });
      return NextResponse.json({ message: "Reset email sent" }, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
