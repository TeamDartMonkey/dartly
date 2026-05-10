import { prisma } from "@/services/prisma";
import type { UserPreferences } from "@/types/settings";
import { DEFAULT_PREFERENCES } from "@/types/settings";

function mergeWithDefaults(partial: Record<string, unknown> | null): UserPreferences {
  if (!partial) return { ...DEFAULT_PREFERENCES };
  return { ...DEFAULT_PREFERENCES, ...partial };
}

export async function getSettings(userId: string): Promise<UserPreferences> {
  const row = await prisma.userSettings.findUnique({
    where: { userId },
    select: { preferences: true },
  });
  return mergeWithDefaults(row?.preferences as Record<string, unknown> | null);
}

// Wrap the read-modify-write inside a transaction so two concurrent PATCHes
// cannot both read the same baseline and overwrite each other's changes.
// Without this, the last write wins on every field, silently losing the
// other request's changes.
export async function upsertSettings(
  userId: string,
  patch: Partial<UserPreferences>
): Promise<UserPreferences> {
  return prisma.$transaction(async (tx) => {
    const row = await tx.userSettings.findUnique({
      where: { userId },
      select: { preferences: true },
    });
    const current = mergeWithDefaults(row?.preferences as Record<string, unknown> | null);
    const merged = { ...current, ...patch };

    await tx.userSettings.upsert({
      where: { userId },
      create: { userId, preferences: merged },
      update: { preferences: merged },
    });

    return merged;
  });
}
