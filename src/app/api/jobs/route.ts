import { NextResponse } from "next/server";

const jobs: Array<{
  id: string;
  title: string;
  company: string;
  location?: string;
  stage?: string;
  priority?: boolean;
}> = [];

export async function GET() {
  return NextResponse.json(jobs, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json();

  const newJob = {
    id: String(Date.now()),
    title: body.title ?? "Untitled Job",
    company: body.company ?? "Unknown Company",
    location: body.location ?? "",
    stage: body.stage ?? "INTERESTED",
    priority: body.priority ?? false,
  };

  jobs.push(newJob);

  return NextResponse.json(newJob, { status: 201 });
}
