import "server-only";
import type { NextRequest } from "next/server";
import { z } from "zod/v4";
import { ApiError } from "@/lib/api-error";

// Cap raw JSON body size to mitigate trivial DoS via massive payloads. Routes
// with legitimately larger bodies (uploads via multipart) do not use this helper.
const MAX_BODY_BYTES = 1_000_000; // 1 MB

export async function validateBody<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    throw new ApiError(413, "Request body too large");
  }

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
