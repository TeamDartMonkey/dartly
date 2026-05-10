// Document tag normalization rules. Centralized here so the validation
// schema, the service layer, the seed script, and any future tag UI all apply
// the same constraints — preventing silent drift between client and server.
//
// Rules:
// • Trim whitespace.
// • Reject empty strings (after trim).
// • Reject characters outside [A-Za-z0-9 _-] to keep filter UIs predictable.
// • Reject tags longer than MAX_TAG_LENGTH characters.
// • Dedupe case-insensitively, preserving the FIRST occurrence's casing
//   (so "Frontend" then "frontend" yields ["Frontend"]).
// • Cap the per-document tag count at MAX_TAGS_PER_DOC.
// • Output is sorted ASCII case-insensitively for stable display.
//
// `normalizeTags` is permissive: it silently drops invalid entries and dedupes.
// `validateTags` is strict: it throws TagValidationError on any violation.
// API routes use validateTags for explicit 400s; the service layer calls
// normalizeTags as a final safety net so a buggy client cannot persist
// pathological input.

export const MAX_TAG_LENGTH = 32;
export const MAX_TAGS_PER_DOC = 10;
export const TAG_PATTERN = /^[A-Za-z0-9 _-]+$/;

export class TagValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TagValidationError";
  }
}

function isValidTag(tag: string): boolean {
  return tag.length > 0 && tag.length <= MAX_TAG_LENGTH && TAG_PATTERN.test(tag);
}

/**
 * Normalize a list of tags: trim, drop empty/invalid, dedupe case-insensitively
 * preserving first-typed casing, cap to MAX_TAGS_PER_DOC, and sort.
 * Never throws — invalid entries are silently dropped.
 */
export function normalizeTags(input: readonly string[] | undefined | null): string[] {
  if (!input) return [];

  const seenLower = new Set<string>();
  const out: string[] = [];

  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (!isValidTag(trimmed)) continue;
    const key = trimmed.toLowerCase();
    if (seenLower.has(key)) continue;
    seenLower.add(key);
    out.push(trimmed);
    if (out.length >= MAX_TAGS_PER_DOC) break;
  }

  out.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  return out;
}

/**
 * Strict validation suitable for API request handling. Throws
 * TagValidationError on any rule violation. Returns the normalized array.
 */
export function validateTags(input: readonly string[] | undefined | null): string[] {
  if (input == null) return [];
  if (!Array.isArray(input)) {
    throw new TagValidationError("tags must be an array of strings");
  }
  if (input.length > MAX_TAGS_PER_DOC) {
    throw new TagValidationError(`Maximum of ${MAX_TAGS_PER_DOC} tags per document`);
  }

  const seenLower = new Set<string>();
  const out: string[] = [];

  for (const raw of input) {
    if (typeof raw !== "string") {
      throw new TagValidationError("Each tag must be a string");
    }
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      throw new TagValidationError("Tags cannot be empty");
    }
    if (trimmed.length > MAX_TAG_LENGTH) {
      throw new TagValidationError(`Tag exceeds ${MAX_TAG_LENGTH} characters: "${trimmed}"`);
    }
    if (!TAG_PATTERN.test(trimmed)) {
      throw new TagValidationError(
        `Tag "${trimmed}" contains invalid characters (allowed: letters, numbers, spaces, hyphens, underscores)`
      );
    }
    const key = trimmed.toLowerCase();
    if (seenLower.has(key)) {
      throw new TagValidationError(`Duplicate tag: "${trimmed}"`);
    }
    seenLower.add(key);
    out.push(trimmed);
  }

  out.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  return out;
}
