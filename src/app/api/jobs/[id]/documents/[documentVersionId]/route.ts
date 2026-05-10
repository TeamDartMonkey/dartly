import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/services/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
    documentVersionId: string;
  }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id: jobId, documentVersionId } = await context.params;

      // Defense-in-depth: scope the deletion through both the job and the
      // document by userId. Today the link can only exist if both belonged
      // to the user, but if a future bulk-import / SQL path ever creates
      // cross-user rows, this prevents a user from deleting them via the
      // job they happen to own.
      const { count } = await prisma.jobDocumentLink.deleteMany({
        where: {
          jobId,
          documentVersionId,
          job: { userId: user.id },
          document: { userId: user.id },
        },
      });

      if (count === 0) {
        return NextResponse.json({ error: "Document link not found" }, { status: 404 });
      }

      logger.info("Job-document link removed", {
        userId: user.id,
        jobId,
        documentVersionId,
      });

      return new NextResponse(null, { status: 204 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
