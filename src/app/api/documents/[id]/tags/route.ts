import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { updateDocumentTags } from "@/services/documents";
import { UpdateDocumentTagsSchema } from "@/types/schemas";

type RouteContext = { params: Promise<{ id: string }> };

// Replace the document's tag set. Wholesale replacement is intentional —
// the chip-input UI sends the full canonical list on every save, which makes
// concurrent edits last-write-wins (acceptable for a single-user resource).
export async function PUT(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id } = await context.params;
      const { tags } = await validateBody(request, UpdateDocumentTagsSchema);

      const doc = await updateDocumentTags(id, user.id, tags);
      if (!doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      logger.info("Document tags updated", {
        userId: user.id,
        documentId: id,
        tagCount: doc.tags.length,
      });
      return NextResponse.json(doc, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
