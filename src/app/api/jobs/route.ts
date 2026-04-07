import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { createJob, getJobsByUserId, toJobResponse } from "@/services/jobs";
import { CreateJobSchema } from "@/types/schemas";

export async function GET(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const jobs = await getJobsByUserId(user.id);
      return NextResponse.json(jobs.map(toJobResponse), { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}

export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const data = await validateBody(request, CreateJobSchema);

      const job = await createJob({
        userId: user.id,
        ...data,
      });

      logger.info("Job created", {
        userId: user.id,
        title: data.title,
        company: data.company,
      });

      return NextResponse.json(toJobResponse(job), { status: 201 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
