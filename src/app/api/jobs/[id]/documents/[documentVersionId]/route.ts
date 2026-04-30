import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
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

      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          userId: user.id,
        },
      });

      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      const { count } = await prisma.jobDocumentLink.deleteMany({
        where: {
          jobId,
          documentVersionId,
        },
      });

      if (count === 0) {
        return NextResponse.json({ error: "Document link not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
