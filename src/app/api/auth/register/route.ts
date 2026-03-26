import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { registerUser } from "@/services/auth";

//this function runs when a POST request is made to /api/auth/register
export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
    //rate limit of 10 per min per IP
    const rateLimitResponse = await checkRateLimit(request, {
      id: "api/auth/register",
      limit: 10,
      windowSecs: 60,
    });

    if (rateLimitResponse) return rateLimitResponse;

    const { email, password } = await request.json();

    //server side validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    try {
      await registerUser(email, password);
      logger.info("New user registered", { email });
      return NextResponse.json({ success: true }, { status: 201 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
