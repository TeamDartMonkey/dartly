"use client";

import { useState } from "react";
import { showToast } from "@/components/ui/toast";
import type { JobActivity } from "@/types/activity";

interface Props {
  activities: JobActivity[];
  jobId: string;
  onActivitiesChanged: () => Promise<void>;
}

export function TimelineSection({ activities, jobId, onActivitiesChanged }: Props) {
  const [addingNote, setAddingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDesc, setNoteDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const sorted = [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  async function handleAddNote() {
    if (!noteTitle.trim()) { showToast("Note title is required", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "NOTE",
          title: noteTitle.trim(),
          description: noteDesc.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      await onActivitiesChanged();
      setNoteTitle("");
      setNoteDesc("");
      setAddingNote(false);
      showToast("Note added");
    } catch {
      showToast("Failed to add note", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-medium text-zinc-50">Timeline</h2>
        <button type="button" onClick={() => setAddingNote(true)}
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          + Add note
        </button>
      </div>

      {addingNote && (
        <div className="mb-6 bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
          <div>
            <label htmlFor="note-title" className="block text-xs font-medium text-zinc-400 mb-1">Note title *</label>
            <input id="note-title" type="text" value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g. Heard back from recruiter"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="note-desc" className="block text-xs font-medium text-zinc-400 mb-1">Details</label>
            <textarea id="note-desc" value={noteDesc} onChange={(e) => setNoteDesc(e.target.value)}
              placeholder="Optional details..." rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button"
              onClick={() => { setAddingNote(false); setNoteTitle(""); setNoteDesc(""); }}
              className="bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-3 py-1.5 rounded-md text-sm">
              Cancel
            </button>
            <button type="button" onClick={handleAddNote} disabled={saving}
              className="bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-50">
              {saving ? "Saving..." : "Add note"}
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-8">
          No activity yet. Events will appear here as you update this job.
        </p>
      ) : (
        <ol className="relative border-l border-zinc-700 space-y-6 ml-3">
          {sorted.map((activity) => (
            <li key={activity.id} className="ml-6">
              <span className="absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full bg-zinc-800 border border-zinc-600 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[activity.type] ?? "bg-zinc-500"}`} />
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-200">{activity.title}</p>
                {activity.description && (
                  <p className="text-xs text-zinc-400 mt-0.5">{activity.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_BADGE[activity.type] ?? "bg-zinc-800 text-zinc-400"}`}>
                    {activity.type.charAt(0) + activity.type.slice(1).toLowerCase()}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(activity.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const DOT_COLORS: Record<string, string> = {
  STAGE: "bg-indigo-500", APPLIED: "bg-blue-500", INTERVIEW: "bg-amber-500",
  FOLLOWUP: "bg-zinc-400", NOTE: "bg-zinc-500", OUTCOME: "bg-green-500",
};

const TYPE_BADGE: Record<string, string> = {
  STAGE: "bg-indigo-950 text-indigo-400", APPLIED: "bg-blue-950 text-blue-400",
  INTERVIEW: "bg-amber-950 text-amber-400", FOLLOWUP: "bg-zinc-800 text-zinc-300",
  NOTE: "bg-zinc-800 text-zinc-400", OUTCOME: "bg-green-950 text-green-400",
};