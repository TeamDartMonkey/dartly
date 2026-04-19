import { type NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { generateResumeDraft } from "@/services/ai";
import { createDocument, toDocumentResponse } from "@/services/documents";
import { prisma } from "@/services/prisma";
import { getProfile } from "@/services/profile";
import { GenerateDocumentSchema } from "@/types/schemas";

export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
    const rateLimitResponse = await checkRateLimit(request, {
      id: "api/ai/resume",
      limit: 10,
      windowSecs: 60,
    });
    if (rateLimitResponse) return rateLimitResponse;

    try {
      const user = await requireAuth();
      const { jobId } = await validateBody(request, GenerateDocumentSchema);

      const profile = await getProfile(user.id);
      if (!profile) {
        throw new ApiError(400, "Profile is required to generate a resume");
      }

      const job = await prisma.job.findFirst({
        where: { id: jobId, userId: user.id },
      });
      if (!job) {
        throw new ApiError(404, "Job not found");
      }

      const result = await generateResumeDraft(profile, {
        title: job.title,
        company: job.company,
        description: job.description ?? undefined,
      });

      const { doc, version } = await createDocument(user.id, {
        type: "RESUME",
        name: `Resume - ${job.company}`,
        content: result.content,
        jobId,
      });

      logger.info("AI resume draft generated", {
        userId: user.id,
        jobId,
        documentId: doc.id,
      });

      return NextResponse.json(toDocumentResponse(doc, version), { status: 201 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
