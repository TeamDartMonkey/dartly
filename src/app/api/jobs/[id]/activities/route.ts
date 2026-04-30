import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { createActivity, getActivities, verifyJobOwnership } from "@/services/activities";
import { CreateActivitySchema } from "@/types/schemas/activity";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id: jobId } = await context.params;

      const owned = await verifyJobOwnership(jobId, user.id);
      if (!owned) return NextResponse.json({ error: "Job not found" }, { status: 404 });

      const activities = await getActivities(jobId);
      return NextResponse.json(activities, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id: jobId } = await context.params;

      const owned = await verifyJobOwnership(jobId, user.id);
      if (!owned) return NextResponse.json({ error: "Job not found" }, { status: 404 });

      const data = await validateBody(request, CreateActivitySchema);
      const activity = await createActivity(jobId, data);

      logger.info("Activity created", { userId: user.id, jobId, type: data.type });
      return NextResponse.json(activity, { status: 201 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
