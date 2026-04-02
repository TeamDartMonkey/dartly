import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { createJob, getJobsByUserId, toJobResponse } from "@/services/jobs";

export async function GET(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const jobs = await getJobsByUserId(user.id);
      return NextResponse.json(jobs.map(toJobResponse), { status: 200 });
    } catch (err) {
      logger.error("Failed to fetch jobs", { err });
      return handleApiError(err);
    }
  });
}

export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();

      const { title, company, location, stage, priority } = await request.json();

      if (!title || !company) {
        return NextResponse.json({ error: "Title and company are required." }, { status: 400 });
      }

      const job = await createJob({
        userId: user.id,
        title,
        company,
        location,
        stage,
        priority,
      });

      logger.info("Job created", {
        userId: user.id,
        title,
        company,
      });

      return NextResponse.json(toJobResponse(job), { status: 201 });
    } catch (err) {
      logger.error("Failed to create job", { err });
      return handleApiError(err);
    }
  });
}
