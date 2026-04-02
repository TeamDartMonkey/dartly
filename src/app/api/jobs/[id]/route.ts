import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { deleteJob, toJobResponse, updateJob } from "@/services/jobs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id } = await context.params;
      const { title, company, location, stage, priority } = await request.json();

      const job = await updateJob(id, user.id, { title, company, location, stage, priority });

      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      logger.info("Job updated", { userId: user.id, jobId: id });
      return NextResponse.json(toJobResponse(job), { status: 200 });
    } catch (err) {
      logger.error("Failed to update job", { err });
      return handleApiError(err);
    }
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id } = await context.params;

      const deleted = await deleteJob(id, user.id);

      if (!deleted) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      logger.info("Job deleted", { userId: user.id, jobId: id });
      return new NextResponse(null, { status: 204 });
    } catch (err) {
      logger.error("Failed to delete job", { err });
      return handleApiError(err);
    }
  });
}
