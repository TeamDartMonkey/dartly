import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import { requireAuth } from "@/lib/requireAuth";
import { getDashboardMetrics } from "@/services/metrics";

export async function GET(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const metrics = await getDashboardMetrics(user.id);
      return NextResponse.json(metrics, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
