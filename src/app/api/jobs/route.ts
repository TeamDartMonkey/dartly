import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { createClient } from "@/lib/supabase-server";
import { createJob, getJobsByUserId } from "@/services/jobs";

export async function GET(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const jobs = await getJobsByUserId(user.id);
      return NextResponse.json(jobs, { status: 200 });
    } catch (err) {
      logger.error("Failed to fetch jobs", { err });
      return handleApiError(err);
    }
  });
}

export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

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

      return NextResponse.json(job, { status: 201 });
    } catch (err) {
      logger.error("Failed to create job", { err });
      return handleApiError(err);
    }
  });
}
