import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { getProfile, upsertProfile } from "@/services/profile";
import { ProfilePatchSchema } from "@/types/schemas";

export async function GET(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const profile = await getProfile(user.id);
      return NextResponse.json(profile ?? {}, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}

export async function PUT(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const data = await validateBody(request, ProfilePatchSchema);
      const profile = await upsertProfile(user.id, data);
      logger.info("Profile updated", { userId: user.id });
      return NextResponse.json(profile, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
