import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { getProfile, upsertProfile } from "@/services/profile";

export async function GET(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const profile = await getProfile(user.id);
      return NextResponse.json(profile ?? {}, { status: 200 });
    } catch (err) {
      logger.error("Failed to fetch profile", { err });
      return handleApiError(err);
    }
  });
}

export async function PUT(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const body = await request.json();
      const profile = await upsertProfile(user.id, body);
      logger.info("Profile updated", { userId: user.id });
      return NextResponse.json(profile, { status: 200 });
    } catch (err) {
      logger.error("Failed to update profile", { err });
      return handleApiError(err);
    }
  });
}
