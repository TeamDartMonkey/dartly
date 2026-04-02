import { NextResponse } from "next/server";
import { createJob, getJobsByUserId } from "@/services/jobs";

const USER_ID = "demo-user";

export async function GET() {
  try {
    const jobs = await getJobsByUserId(USER_ID);
    return NextResponse.json(jobs, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.company) {
      return NextResponse.json({ error: "title and company are required" }, { status: 400 });
    }

    const job = await createJob({
      userId: USER_ID,
      title: body.title,
      company: body.company,
      location: body.location,
      stage: body.stage,
      priority: body.priority,
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Failed to create job:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
