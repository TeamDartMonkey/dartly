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

export async function upsertSettings(
  userId: string,
  patch: Partial<UserPreferences>
): Promise<UserPreferences> {
  const current = await getSettings(userId);
  const merged = { ...current, ...patch };

  await prisma.userSettings.upsert({
    where: { userId },
    create: { userId, preferences: merged },
    update: { preferences: merged },
  });

  return merged;
}
