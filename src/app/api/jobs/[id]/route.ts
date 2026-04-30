import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { deleteJob, getJob, toJobResponse, updateJob } from "@/services/jobs";
import { UpdateJobSchema } from "@/types/schemas";

type RouteContext = { params: Promise<{ id: string }> };

// Detail page needs to fetch a single job
export async function GET(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id } = await context.params;

      const job = await getJob(id, user.id);

      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      return NextResponse.json(toJobResponse(job), { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id } = await context.params;
      const data = await validateBody(request, UpdateJobSchema);

      const job = await updateJob(id, user.id, data);

      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      logger.info("Job updated", { userId: user.id, jobId: id });
      return NextResponse.json(toJobResponse(job), { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}

// Unchanged from Sprint 1
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
      return handleApiError(err);
    }
  });
}
