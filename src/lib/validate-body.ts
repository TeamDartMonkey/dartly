import "server-only";
import type { NextRequest } from "next/server";
import { z } from "zod/v4";
import { ApiError } from "@/lib/api-error";

// Cap raw JSON body size to mitigate trivial DoS via massive payloads. Routes
// with legitimately larger bodies (multipart uploads) do not use this helper.
const MAX_BODY_BYTES = 1_000_000; // 1 MB

async function readCappedText(request: NextRequest): Promise<string> {
  // Fast path: trust Content-Length when present.
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const len = Number(contentLength);
    if (Number.isFinite(len) && len > MAX_BODY_BYTES) {
      throw new ApiError(413, "Request body too large");
    }
  }

  // Always also stream-cap to defend against missing/lying Content-Length and
  // chunked transfer encoding.
  const body = request.body;
  if (!body) return "";

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let out = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > MAX_BODY_BYTES) {
      reader.cancel().catch(() => {
        /* already errored */
      });
      throw new ApiError(413, "Request body too large");
    }
    out += decoder.decode(value, { stream: true });
  }
  out += decoder.decode();
  return out;
}

export async function validateBody<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    const text = await readCappedText(request);
    raw = text === "" ? undefined : JSON.parse(text);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(400, "Invalid JSON body");
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ApiError(400, z.prettifyError(result.error));
  }
  return result.data;
}
