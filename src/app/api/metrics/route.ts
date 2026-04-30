import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import { requireAuth } from "@/lib/requireAuth";
import { getAnalyticsBreakdown, getDashboardMetrics } from "@/services/metrics";

export async function GET(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const [metrics, analytics] = await Promise.all([
        getDashboardMetrics(user.id),
        getAnalyticsBreakdown(user.id),
      ]);
      return NextResponse.json({ ...metrics, analytics }, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
