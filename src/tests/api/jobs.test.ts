import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetJobsByUserId, mockCreateJob, mockToJobResponse, mockRequireAuth } = vi.hoisted(
  () => ({
    mockGetJobsByUserId: vi.fn(),
    mockCreateJob: vi.fn(),
    mockToJobResponse: vi.fn(),
    mockRequireAuth: vi.fn(),
  })
);

const mockValidatedData = { value: null as unknown };

vi.mock("@/lib/api-wrapper", () => ({
  withHttpLogging: vi.fn((_req: unknown, handler: () => unknown) => handler()),
}));

vi.mock("@/lib/requireAuth", () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock("@/lib/validate-body", () => ({
  validateBody: vi.fn(async (_req: unknown, _schema: unknown) => mockValidatedData.value),
}));

vi.mock("@/lib/logger", () => ({
  default: { info: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}));

vi.mock("@/services/jobs", () => ({
  getJobsByUserId: mockGetJobsByUserId,
  createJob: mockCreateJob,
  toJobResponse: mockToJobResponse,
}));

import { GET, POST } from "@/app/api/jobs/route";

const mockUser = { id: "user-123" };

function makeRequest(body?: object): NextRequest {
  return new Request("http://localhost/api/jobs", {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }) as unknown as NextRequest;
}

describe("GET /api/jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  it("returns 200 with empty array when no jobs", async () => {
    mockGetJobsByUserId.mockResolvedValue([]);
    mockToJobResponse.mockReturnValue;

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("returns 200 with mapped jobs", async () => {
    const prismaJobs = [
      { id: "j1", title: "Engineer", stage: "APPLIED" },
      { id: "j2", title: "Dev", stage: "INTERVIEW" },
    ];
    const mapped = [
      { id: "j1", title: "Engineer", stage: "Applied" },
      { id: "j2", title: "Dev", stage: "Interview" },
    ];
    mockGetJobsByUserId.mockResolvedValue(prismaJobs);
    mockToJobResponse.mockImplementation((j: { id: string }) => mapped.find((m) => m.id === j.id));

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mapped);
    expect(mockGetJobsByUserId).toHaveBeenCalledWith("user-123");
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });
});

describe("POST /api/jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  it("returns 201 with created job", async () => {
    const inputData = { title: "Engineer", company: "Acme" };
    const created = { id: "j1", title: "Engineer", company: "Acme", stage: "INTERESTED" };
    const mapped = { id: "j1", title: "Engineer", company: "Acme", stage: "Interested" };
    mockValidatedData.value = inputData;
    mockCreateJob.mockResolvedValue(created);
    mockToJobResponse.mockReturnValue(mapped);

    const res = await POST(makeRequest(inputData));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body).toEqual(mapped);
    expect(mockCreateJob).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-123", title: "Engineer", company: "Acme" })
    );
  });

  it("returns 400 when title is missing", async () => {
    const { ApiError } = await import("@/lib/api-error");
    const { validateBody } = await import("@/lib/validate-body");
    (validateBody as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new ApiError(400, "Title is required")
    );

    const res = await POST(makeRequest({ company: "Acme" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when company is missing", async () => {
    const { ApiError } = await import("@/lib/api-error");
    const { validateBody } = await import("@/lib/validate-body");
    (validateBody as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new ApiError(400, "Company is required")
    );

    const res = await POST(makeRequest({ title: "Engineer" }));
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await POST(makeRequest({ title: "Engineer", company: "Acme" }));
    expect(res.status).toBe(401);
  });
});
