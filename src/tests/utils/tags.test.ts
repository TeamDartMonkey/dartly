import { describe, expect, it } from "vitest";
import {
  MAX_TAG_LENGTH,
  MAX_TAGS_PER_DOC,
  TagValidationError,
  normalizeTags,
  validateTags,
} from "@/utils/tags";

describe("normalizeTags", () => {
  it("returns [] for nullish input", () => {
    expect(normalizeTags(undefined)).toEqual([]);
    expect(normalizeTags(null)).toEqual([]);
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeTags(["  Frontend  ", "\tBackend\n"])).toEqual(["Backend", "Frontend"]);
  });

  it("drops empty strings after trim", () => {
    expect(normalizeTags(["  ", "Frontend", ""])).toEqual(["Frontend"]);
  });

  it("dedupes case-insensitively, preserving first-typed casing", () => {
    expect(normalizeTags(["Frontend", "frontend", "FRONTEND"])).toEqual(["Frontend"]);
    expect(normalizeTags(["frontend", "Frontend"])).toEqual(["frontend"]);
  });

  it("drops tags with invalid characters", () => {
    expect(normalizeTags(["good", "bad/tag", "ok-tag", "no@symbols"])).toEqual([
      "good",
      "ok-tag",
    ]);
  });

  it("drops overlong tags", () => {
    const tooLong = "a".repeat(MAX_TAG_LENGTH + 1);
    const okLong = "a".repeat(MAX_TAG_LENGTH);
    expect(normalizeTags([tooLong, okLong])).toEqual([okLong]);
  });

  it("caps the result at MAX_TAGS_PER_DOC", () => {
    const many = Array.from({ length: MAX_TAGS_PER_DOC + 5 }, (_, i) => `tag${i}`);
    expect(normalizeTags(many)).toHaveLength(MAX_TAGS_PER_DOC);
  });

  it("returns case-insensitively sorted output", () => {
    expect(normalizeTags(["zeta", "Alpha", "beta"])).toEqual(["Alpha", "beta", "zeta"]);
  });

  it("ignores non-string entries", () => {
    // Defensive — service layer accepts unknown[] for runtime safety.
    expect(normalizeTags([1 as unknown as string, "ok", null as unknown as string])).toEqual([
      "ok",
    ]);
  });
});

describe("validateTags", () => {
  it("returns [] for nullish input", () => {
    expect(validateTags(undefined)).toEqual([]);
    expect(validateTags(null)).toEqual([]);
  });

  it("accepts a clean list and returns sorted output", () => {
    expect(validateTags(["zeta", "alpha"])).toEqual(["alpha", "zeta"]);
  });

  it("throws on empty tag", () => {
    expect(() => validateTags(["ok", "  "])).toThrow(TagValidationError);
  });

  it("throws on tag exceeding MAX_TAG_LENGTH", () => {
    expect(() => validateTags(["a".repeat(MAX_TAG_LENGTH + 1)])).toThrow(TagValidationError);
  });

  it("throws on invalid characters", () => {
    expect(() => validateTags(["bad/tag"])).toThrow(/invalid characters/);
    expect(() => validateTags(["bad@tag"])).toThrow(/invalid characters/);
    expect(() => validateTags(["bad!tag"])).toThrow(/invalid characters/);
  });

  it("throws on case-insensitive duplicate", () => {
    expect(() => validateTags(["Frontend", "frontend"])).toThrow(/Duplicate tag/);
  });

  it("throws on too many tags", () => {
    const many = Array.from({ length: MAX_TAGS_PER_DOC + 1 }, (_, i) => `tag${i}`);
    expect(() => validateTags(many)).toThrow(/Maximum/);
  });

  it("throws on non-array input", () => {
    expect(() => validateTags("not an array" as unknown as string[])).toThrow(
      TagValidationError
    );
  });

  it("allows letters, digits, spaces, hyphens, underscores", () => {
    expect(validateTags(["Front End", "Back-end", "snake_case", "numbers123"])).toEqual([
      "Back-end",
      "Front End",
      "numbers123",
      "snake_case",
    ]);
  });
});
