import { type NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { rewriteContent } from "@/services/ai";
import { getDocumentById } from "@/services/documents";
import { RewriteContentSchema } from "@/types/schemas";

export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
    const rateLimitResponse = await checkRateLimit(request, {
      id: "api/ai/rewrite",
      limit: 10,
      windowSecs: 60,
    });
    if (rateLimitResponse) return rateLimitResponse;

    try {
      const user = await requireAuth();
      const { documentId, instruction } = await validateBody(request, RewriteContentSchema);

      const doc = await getDocumentById(documentId, user.id);
      if (!doc) {
        throw new ApiError(404, "Document not found");
      }

      if (!doc.content) {
        throw new ApiError(400, "Document has no content to rewrite");
      }

      const result = await rewriteContent({
        content: doc.content,
        instruction,
      });

      // Log only the length of the user-supplied instruction, not the
      // content itself, to avoid persisting arbitrary user prose (which can
      // include PII or sensitive context) into log files.
      logger.info("AI rewrite generated", {
        userId: user.id,
        documentId,
        instructionLength: instruction.length,
      });

      return NextResponse.json(
        { original: doc.content, rewritten: result.content },
        { status: 200 }
      );
    } catch (err) {
      return handleApiError(err);
    }
  });
}
