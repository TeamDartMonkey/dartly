"use client";

import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/ui/toast";
import type { JobActivity } from "@/types/activity";

interface Props {
  activities: JobActivity[];
  jobId: string;
  onActivitiesChanged: () => Promise<void>;
}

export function TimelineSection({ activities, jobId, onActivitiesChanged }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const today = () => new Date().toISOString().split("T")[0];
  const emptyForm = { title: "", date: today(), description: "" };
  const [form, setForm] = useState(emptyForm);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function startEdit(activity: JobActivity) {
    setEditingId(activity.id);
    setForm({
      title: activity.title,
      date: activity.scheduledAt ? activity.scheduledAt.slice(0, 10) : today(),
      description: activity.description ?? "",
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm, date: today() });
  }

  async function handleSave() {
    if (!form.title.trim()) {
      showToast("Note title is required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        type: "NOTE",
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        scheduledAt: new Date(`${form.date}T00:00:00`).toISOString(),
      };
      const url = editingId
        ? `/api/jobs/${jobId}/activities/${editingId}`
        : `/api/jobs/${jobId}/activities`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      await onActivitiesChanged();
      handleCancel();
      showToast(editingId ? "Note updated" : "Note added");
    } catch {
      showToast("Failed to save note", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/jobs/${jobId}/activities/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await onActivitiesChanged();
      showToast("Note removed");
    } catch {
      showToast("Failed to remove note", "error");
    } finally {
      setDeleting(null);
    }
  }

  const sorted = [...activities].sort((a, b) => {
    const aDate = a.scheduledAt ?? a.createdAt;
    const bDate = b.scheduledAt ?? b.createdAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-medium text-zinc-50">Timeline</h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            + Add note
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-zinc-200">
            {editingId ? "Edit note" : "Add note"}
          </h3>
          <Input
            id="note-title"
            label="Note title *"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Heard back from recruiter"
          />
          <DatePicker
            id="note-date"
            label="Date"
            value={form.date}
            onChange={(v) => setForm((prev) => ({ ...prev, date: v }))}
            placeholder="Select date"
          />
          <Textarea
            id="note-desc"
            label="Details"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional details..."
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-3 py-1.5 rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Save changes" : "Add note"}
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !showForm ? (
        <p className="text-sm text-zinc-500 text-center py-8">
          No activity yet. Events will appear here as you update this job.
        </p>
      ) : (
        <ol className="relative border-l border-zinc-700 space-y-6 ml-3">
          {sorted.map((activity) => (
            <li key={activity.id} className="ml-6">
              <span className="absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full bg-zinc-800 border border-zinc-600 mt-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[activity.type] ?? "bg-zinc-500"}`}
                />
              </span>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-zinc-200">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-zinc-400 mt-0.5">{activity.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_BADGE[activity.type] ?? "bg-zinc-800 text-zinc-400"}`}
                    >
                      {activity.type.charAt(0) + activity.type.slice(1).toLowerCase()}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {new Date(activity.scheduledAt ?? activity.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(activity)}
                    className="text-xs text-zinc-400 hover:text-zinc-50 px-2 py-1 rounded hover:bg-zinc-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(activity.id)}
                    disabled={deleting === activity.id}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  >
                    {deleting === activity.id ? "..." : "Delete"}
                  </button>
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
  STAGE: "bg-indigo-500",
  APPLIED: "bg-blue-500",
  INTERVIEW: "bg-amber-500",
  FOLLOWUP: "bg-zinc-400",
  NOTE: "bg-zinc-500",
};

const TYPE_BADGE: Record<string, string> = {
  STAGE: "bg-indigo-950 text-indigo-400",
  APPLIED: "bg-blue-950 text-blue-400",
  INTERVIEW: "bg-amber-950 text-amber-400",
  FOLLOWUP: "bg-zinc-800 text-zinc-300",
  NOTE: "bg-zinc-800 text-zinc-400",
};
