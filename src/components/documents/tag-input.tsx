"use client";

import { useId, useRef, useState } from "react";
import { MAX_TAG_LENGTH, MAX_TAGS_PER_DOC, normalizeTags, validateTags } from "@/utils/tags";

type TagInputProps = {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  // Compact variant uses smaller chips, no helper text — used inline on cards.
  // Full variant is for the detail page editor.
  variant?: "full" | "compact";
  ariaLabel?: string;
};

// Inline chip input. Type a tag, press Enter or comma to commit. Backspace on
// empty input removes the trailing chip. Validation/dedupe rules live in
// utils/tags so client and server stay aligned.
export function TagInput({
  value,
  onChange,
  disabled = false,
  variant = "full",
  ariaLabel = "Tags",
}: TagInputProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();

  const atLimit = value.length >= MAX_TAGS_PER_DOC;

  function tryAddCurrent(): boolean {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft("");
      return false;
    }
    try {
      // Validate the proposed combined list strictly so the user gets a clear
      // error message (case-insensitive duplicate, character set, length, max).
      const next = validateTags([...value, trimmed]);
      onChange(next);
      setDraft("");
      setError(null);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid tag");
      return false;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      tryAddCurrent();
      return;
    }
    if (e.key === "Backspace" && draft === "" && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, -1));
      setError(null);
    }
  }

  function handleBlur() {
    // Commit any pending text on blur so users don't lose work by clicking
    // away. If invalid, surface the error so it isn't silently dropped.
    if (draft.trim()) tryAddCurrent();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text");
    if (!pasted.includes(",")) return;
    e.preventDefault();
    const candidates = pasted.split(",");
    const merged = normalizeTags([...value, ...candidates, draft]);
    onChange(merged);
    setDraft("");
    setError(null);
  }

  function removeTag(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
    setError(null);
    inputRef.current?.focus();
  }

  const isCompact = variant === "compact";

  return (
    <div>
      {/* Use a <label> wrapper so any click on the chip area focuses the input
          natively — no JS click delegation, no a11y warnings. */}
      <label
        htmlFor={fieldId}
        className={[
          "flex flex-wrap items-center gap-1.5 bg-zinc-800 border rounded-md px-2 py-1.5",
          "focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent",
          "cursor-text",
          error ? "border-red-500" : "border-zinc-700",
          disabled ? "opacity-60 cursor-not-allowed" : "",
        ].join(" ")}
      >
        {value.map((tag) => (
          // Tags are unique case-insensitively after normalization, so the
          // tag string itself is a stable key.
          <span
            key={tag}
            className={[
              "inline-flex items-center gap-1 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
              isCompact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
            ].join(" ")}
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                // Prevent the surrounding <label> from re-focusing the input
                // (which would steal focus on remove). preventDefault is
                // sufficient since label clicks default to focusing #htmlFor.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => removeTag(value.indexOf(tag))}
                aria-label={`Remove tag ${tag}`}
                className="text-indigo-400/80 hover:text-indigo-200 transition-colors"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          id={fieldId}
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onPaste={handlePaste}
          disabled={disabled || atLimit}
          maxLength={MAX_TAG_LENGTH}
          placeholder={
            atLimit
              ? `Max ${MAX_TAGS_PER_DOC} tags`
              : value.length === 0
                ? "Add tags…"
                : "Add another…"
          }
          aria-label={ariaLabel}
          className={[
            "flex-1 min-w-[8ch] bg-transparent border-0 p-0 outline-none",
            "text-zinc-50 placeholder:text-zinc-500",
            isCompact ? "text-xs" : "text-sm",
            "disabled:cursor-not-allowed",
          ].join(" ")}
        />
      </label>
      {error && (
        <p className="mt-1 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
      {!error && variant === "full" && (
        <p className="mt-1 text-xs text-zinc-600">
          Press Enter or comma to add. {value.length}/{MAX_TAGS_PER_DOC} tags.
        </p>
      )}
    </div>
  );
}
