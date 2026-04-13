import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { getDocumentsForJob, linkDocumentToJob } from "@/services/documents";
import { LinkDocumentToJobSchema } from "@/types/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id } = await context.params;

      const docs = await getDocumentsForJob(id, user.id);
      if (!docs) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      return NextResponse.json(docs, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id: jobId } = await context.params;
      const data = await validateBody(request, LinkDocumentToJobSchema);

      const link = await linkDocumentToJob(jobId, data.documentId, data.documentVersionId, user.id);

      if (!link) {
        return NextResponse.json({ error: "Job, document, or version not found" }, { status: 404 });
      }

      logger.info("Document linked to job", {
        userId: user.id,
        jobId,
        documentId: data.documentId,
      });

      return NextResponse.json(
        { id: link.id, linkedAt: link.linkedAt.toISOString() },
        { status: 201 }
      );
    } catch (err) {
      return handleApiError(err);
    }
  });
}
