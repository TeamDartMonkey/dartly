import { NextResponse } from "next/server";

const jobs = [
  {
    id: "1",
    title: "Test Job",
    company: "Test Company",
  },
];

export async function GET() {
  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  const body = await request.json();

  const newJob = {
    id: String(Date.now()),
    title: body.title,
    company: body.company,
  };

  jobs.push(newJob);

  return NextResponse.json(newJob, { status: 201 });
}