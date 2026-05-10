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

      const activities = await getActivities(jobId, user.id);
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

      // Validate body before hitting the DB so malformed traffic does not
      // load the database. Ownership is re-checked inside createActivity.
      const data = await validateBody(request, CreateActivitySchema);

      const owned = await verifyJobOwnership(jobId, user.id);
      if (!owned) return NextResponse.json({ error: "Job not found" }, { status: 404 });

      const activity = await createActivity(jobId, user.id, data);
      if (!activity) return NextResponse.json({ error: "Job not found" }, { status: 404 });

      logger.info("Activity created", { userId: user.id, jobId, type: data.type });
      return NextResponse.json(activity, { status: 201 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
