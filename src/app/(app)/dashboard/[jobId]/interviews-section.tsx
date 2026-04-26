"use client";

import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/ui/toast";
import type { JobActivity } from "@/types/activity";

const ROUND_TYPES = [
  "Phone Screen",
  "Technical Screen",
  "Hiring Manager",
  "Panel",
  "Take-Home",
  "On-Site",
  "Final Round",
  "Other",
];

interface Props {
  activities: JobActivity[]; // pre-filtered to INTERVIEW type by parent
  jobId: string;
  onActivitiesChanged: () => Promise<void>;
}

export function InterviewsSection({ activities, jobId, onActivitiesChanged }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const emptyForm = { roundType: "", title: "", scheduledAt: "", description: "" };
  const [form, setForm] = useState(emptyForm);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function startEdit(activity: JobActivity) {
    setEditingId(activity.id);
    setForm({
      roundType: activity.roundType ?? "",
      title: activity.title,
      scheduledAt: activity.scheduledAt ? activity.scheduledAt.slice(0, 16) : "",
      description: activity.description ?? "",
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      showToast("Interview title is required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        type: "INTERVIEW",
        title: form.title.trim(),
        roundType: form.roundType || null,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
        description: form.description.trim() || undefined,
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
      showToast(editingId ? "Interview updated" : "Interview added");
    } catch {
      showToast("Failed to save interview", "error");
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
      showToast("Interview removed");
    } catch {
      showToast("Failed to remove interview", "error");
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
        <h2 className="text-base font-medium text-zinc-50">Interviews</h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            + Add interview
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-medium text-zinc-200">
            {editingId ? "Edit interview" : "Add interview"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="roundType" className="block text-xs font-medium text-zinc-400 mb-1">
                Round type
              </label>
              <select
                id="roundType"
                name="roundType"
                value={form.roundType}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select round type</option>
                {ROUND_TYPES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <DatePicker
              id="scheduledAt"
              label="Date & time"
              value={form.scheduledAt}
              onChange={(v) => setForm((prev) => ({ ...prev, scheduledAt: v }))}
              placeholder="Select date and time"
              includeTime
            />
          </div>
          <Input
            id="int-title"
            label="Title *"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Technical screen with eng team"
          />
          <Textarea
            id="int-notes"
            label="Notes"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Interviewer names, topics covered, how it went..."
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
              {saving ? "Saving..." : editingId ? "Save changes" : "Add interview"}
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !showForm ? (
        <p className="text-sm text-zinc-500 text-center py-8">No interviews logged yet.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((activity) => (
            <div
              key={activity.id}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  {activity.roundType && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-950 text-amber-400 mb-1">
                      {activity.roundType}
                    </span>
                  )}
                  <p className="text-sm font-medium text-zinc-200">{activity.title}</p>
                  {activity.scheduledAt && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {new Date(activity.scheduledAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                  {activity.description && (
                    <p className="text-xs text-zinc-400 mt-1 whitespace-pre-wrap">
                      {activity.description}
                    </p>
                  )}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
