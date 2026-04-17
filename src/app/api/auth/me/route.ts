import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      return NextResponse.json({ email: user.email }, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
