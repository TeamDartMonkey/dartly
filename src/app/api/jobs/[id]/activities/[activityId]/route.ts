import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { deleteActivity, updateActivity, verifyJobOwnership } from "@/services/activities";
import { UpdateActivitySchema } from "@/types/schemas/activity";

type RouteContext = { params: Promise<{ id: string; activityId: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id: jobId, activityId } = await context.params;

      const data = await validateBody(request, UpdateActivitySchema);

      const owned = await verifyJobOwnership(jobId, user.id);
      if (!owned) return NextResponse.json({ error: "Job not found" }, { status: 404 });

      const activity = await updateActivity(activityId, jobId, user.id, data);

      if (!activity) return NextResponse.json({ error: "Activity not found" }, { status: 404 });

      logger.info("Activity updated", { userId: user.id, jobId, activityId });
      return NextResponse.json(activity, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id: jobId, activityId } = await context.params;

      const owned = await verifyJobOwnership(jobId, user.id);
      if (!owned) return NextResponse.json({ error: "Job not found" }, { status: 404 });

      const deleted = await deleteActivity(activityId, jobId, user.id);
      if (!deleted) return NextResponse.json({ error: "Activity not found" }, { status: 404 });

      logger.info("Activity deleted", { userId: user.id, jobId, activityId });
      return new NextResponse(null, { status: 204 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
