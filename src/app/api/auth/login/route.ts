import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateBody } from "@/lib/validate-body";
import { loginUser } from "@/services/auth";
import { CredentialsSchema } from "@/types/schemas";

export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
    const rateLimitResponse = await checkRateLimit(request, {
      id: "api/auth/login",
      limit: 10,
      windowSecs: 60,
    });

    if (rateLimitResponse) return rateLimitResponse;

    try {
      const { email, password } = await validateBody(request, CredentialsSchema);
      await loginUser(email, password);
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
