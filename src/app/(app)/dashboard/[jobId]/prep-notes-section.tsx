"use client";

import { useState } from "react";
import { showToast } from "@/components/ui/toast";
import type { Job } from "@/types/job";

interface Props {
  job: Job;
  onJobUpdated: (job: Job) => void;
}

const PLACEHOLDER = `Interview prep notes for ${"{company}"}...

Suggested areas to cover:
• STAR stories — situations that show relevant skills
• Questions to ask the interviewer
• Key talking points about your experience
• Things to research before the interview
• Salary / offer considerations`;

export function PrepNotesSection({ job, onJobUpdated }: Props) {
  const [notes, setNotes] = useState(job.prepNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prepNotes: notes.trim() || null }),
      });
      if (!res.ok) throw new Error();
      const updated: Job = await res.json();
      onJobUpdated(updated);
      setIsDirty(false);
      showToast("Prep notes saved");
    } catch {
      showToast("Failed to save prep notes", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setNotes(e.target.value);
    setIsDirty(true);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-medium text-zinc-50">Interview Prep Notes</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Keep your preparation notes for{" "}
            <span className="text-zinc-300">{job.company}</span> in one place.
            These notes are private to this job.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isDirty && (
            <span className="text-xs text-amber-400">Unsaved changes</span>
          )}
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

      <textarea
        value={notes}
        onChange={handleChange}
        placeholder={PLACEHOLDER.replace("{company}", job.company)}
        rows={18}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y leading-relaxed"
        aria-label="Interview prep notes"
      />

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-zinc-600">
          Tip: Use the Research tab to generate company background, then come
          back here to build your prep around it.
        </p>
        {notes.length > 0 && (
          <p className="text-xs text-zinc-600 shrink-0 ml-4">
            {notes.length} characters
          </p>
        )}
      </div>
    </div>
  );
}