import { type NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { generateCompanyResearch } from "@/services/ai";
import { prisma } from "@/services/prisma";
import { GenerateResearchSchema } from "@/types/schemas/job";

export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
    // Research prompts are more expensive — lower rate limit than resume
    const rateLimitResponse = await checkRateLimit(request, {
      id: "api/ai/research",
      limit: 5,
      windowSecs: 60,
    });
    if (rateLimitResponse) return rateLimitResponse;

    try {
      const user = await requireAuth();
      const { jobId, userContext } = await validateBody(request, GenerateResearchSchema);

      // Verify job ownership before generating
      const job = await prisma.job.findFirst({
        where: { id: jobId, userId: user.id },
      });
      if (!job) {
        throw new ApiError(404, "Job not found");
      }

      // Generate research via Gemini
      const result = await generateCompanyResearch({
        company: job.company,
        jobTitle: job.title,
        jobDescription: job.description ?? undefined,
        userContext,
      });

      const updated = await prisma.job.update({
        where: { id: jobId },
        data: { companyResearch: result.content },
      });

      logger.info("AI company research generated", {
        userId: user.id,
        jobId,
      });

      return NextResponse.json(
        { companyResearch: updated.companyResearch },
        { status: 200 }
      );
    } catch (err) {
      return handleApiError(err);
    }
  });
}