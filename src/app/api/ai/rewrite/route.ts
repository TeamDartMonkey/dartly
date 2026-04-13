import { type NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { rewriteContent } from "@/services/ai";
import { getDocumentById } from "@/services/documents";
import { RewriteContentSchema } from "@/types/schemas";

export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
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

      logger.info("AI rewrite generated", {
        userId: user.id,
        documentId,
        instruction,
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
