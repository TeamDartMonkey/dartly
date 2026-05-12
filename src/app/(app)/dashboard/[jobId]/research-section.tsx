"use client";

import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { showToast } from "@/components/ui/toast";
import type { Job } from "@/types/job";
import "@/styles/github-markdown.css";

type ViewMode = "rendered" | "markdown";

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "rendered", label: "Rendered" },
  { value: "markdown", label: "Markdown" },
];

interface Props {
  job: Job;
  onJobUpdated: (job: Job) => void;
}

export function ResearchSection({ job, onJobUpdated }: Props) {
  // The displayed/editable research content
  const [content, setContent] = useState(job.companyResearch ?? "");
  // User context typed into the prompt box before generating
  const [userContext, setUserContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("rendered");

  async function handleGenerate() {
    if (generating || saving) return;
    // Confirm before destroying unsaved edits — the static caption below the
    // button warns about overwrite, but if the user is sitting on dirty
    // content they need an explicit prompt to avoid silent data loss.
    if (
      isDirty &&
      typeof window !== "undefined" &&
      !window.confirm("You have unsaved edits. Regenerating will overwrite them. Continue?")
    ) {
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, userContext: userContext || undefined }),
      });

      if (res.status === 429) {
        showToast("Too many requests — please wait a moment", "error");
        return;
      }
      if (!res.ok) throw new Error();

      const data = await res.json();
      // The API already persisted the result, so we just update local state.
      // No separate save needed after generation — but the user CAN edit and save.
      setContent(data.companyResearch ?? "");
      setIsDirty(false);
      setUserContext("");
      onJobUpdated({ ...job, companyResearch: data.companyResearch });
      showToast("Research generated");
    } catch {
      showToast("Failed to generate research", "error");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (saving || generating) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyResearch: content || null }),
      });
      if (!res.ok) throw new Error();
      const updated: Job = await res.json();
      onJobUpdated(updated);
      setIsDirty(false);
      showToast("Research notes saved");
    } catch {
      showToast("Failed to save research notes", "error");
    } finally {
      setSaving(false);
    }
  }

  const hasContent = content.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Prompt card — always visible so user can regenerate */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-medium text-zinc-50">Company Research</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Generate AI-assisted research about{" "}
              <span className="text-zinc-300">{job.company}</span> to help you prepare for
              interviews and tailor your application.
            </p>
          </div>
          {/* Gemini badge — makes it clear this is AI-generated */}
          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-950 text-indigo-400">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Gemini
          </span>
        </div>

        {/* Optional user context textarea */}
        <div className="mb-4">
          <label
            htmlFor="research-context"
            className="block text-xs font-medium text-zinc-400 mb-1"
          >
            Additional context <span className="text-zinc-600 font-normal">(optional)</span>
          </label>
          <textarea
            id="research-context"
            value={userContext}
            onChange={(e) => setUserContext(e.target.value)}
            placeholder={`e.g. "Focus on their engineering culture and recent AI initiatives" or "I'm interviewing for a frontend role, what should I know?"`}
            rows={3}
            maxLength={2000}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
          />
          <p className="mt-1 text-xs text-zinc-600 text-right">{userContext.length}/2000</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
              <>
                <svg
                  className="animate-spin"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Generating...
              </>
            ) : hasContent ? (
              "Regenerate research"
            ) : (
              "Generate research"
            )}
          </button>
          {hasContent && !generating && (
            <p className="text-xs text-zinc-500">Regenerating will overwrite the current notes.</p>
          )}
        </div>
      </div>

      {/* Research notes — shown once content exists */}
      {hasContent && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-50">Research notes</h3>
            <div className="flex items-center gap-2">
              {VIEW_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setViewMode(opt.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    viewMode === opt.value
                      ? "bg-indigo-500 text-zinc-50"
                      : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {viewMode === "rendered" ? (
            <div className="bg-zinc-950 rounded-md p-6 overflow-auto">
              <div className="github-markdown">
                <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
              </div>
            </div>
          ) : (
            <>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setIsDirty(true);
                }}
                rows={20}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
                aria-label="Company research notes"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-zinc-600">
                  Edit these notes freely — they are saved only to this job and never used as AI input.
                </p>
                <div className="flex items-center gap-2">
                  {isDirty && <span className="text-xs text-amber-400">Unsaved changes</span>}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !isDirty}
                    className="bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Empty state — before first generation */}
      {!hasContent && !generating && (
        <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-lg p-8 text-center">
          <p className="text-sm text-zinc-500">
            No research notes yet. Click &ldquo;Generate research&rdquo; above to get started.
          </p>
        </div>
      )}
    </div>
  );
}
