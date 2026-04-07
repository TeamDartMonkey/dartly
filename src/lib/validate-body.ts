import "server-only";
import type { NextRequest } from "next/server";
import { z } from "zod/v4";
import { ApiError } from "@/lib/api-error";

export async function validateBody<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ApiError(400, z.prettifyError(result.error));
  }
  return result.data;
}
