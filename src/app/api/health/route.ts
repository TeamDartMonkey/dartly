import { NextResponse } from "next/server";
import { createJob, getJobsByUserId } from "@/services/jobs";

const USER_ID = "demo-user";

export async function GET() {
  const jobs = await getJobsByUserId(USER_ID);
  return NextResponse.json(jobs);
}

export async function POST(req: Request) {
  const body = await req.json();

  const job = await createJob({
    userId: USER_ID,
    title: body.title,
    company: body.company,
    location: body.location,
    stage: body.stage,
    priority: body.priority,
  });

  return NextResponse.json(job);
}