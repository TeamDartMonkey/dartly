"use client";

import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/ui/toast";
import type { JobActivity } from "@/types/activity";
import { toLocalDateTimeInput } from "@/utils/datetime";

interface Props {
  activities: JobActivity[]; // pre-filtered to FOLLOWUP type by parent
  jobId: string;
  onActivitiesChanged: () => Promise<void>;
}

export function FollowUpsSection({ activities, jobId, onActivitiesChanged }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const emptyForm = { title: "", scheduledAt: "", description: "" };
  const [form, setForm] = useState(emptyForm);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function startEdit(activity: JobActivity) {
    setEditingId(activity.id);
    setForm({
      title: activity.title,
      // Convert UTC ISO → local datetime-local input format. See
      // utils/datetime.ts for why.
      scheduledAt: activity.scheduledAt ? toLocalDateTimeInput(activity.scheduledAt) : "",
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
    if (saving) return;
    if (!form.title.trim()) {
      showToast("Follow-up title is required", "error");
      return;
    }
    setSaving(true);
    try {
      const isEdit = !!editingId;
      const payload = {
        type: "FOLLOWUP",
        title: form.title.trim(),
        scheduledAt: form.scheduledAt
          ? new Date(form.scheduledAt).toISOString()
          : isEdit
            ? null
            : undefined,
        description: form.description.trim() || (isEdit ? null : undefined),
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
      showToast(editingId ? "Follow-up updated" : "Follow-up added");
    } catch {
      showToast("Failed to save follow-up", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleComplete(activity: JobActivity) {
    setToggling(activity.id);
    try {
      const res = await fetch(`/api/jobs/${jobId}/activities/${activity.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !activity.completed }),
      });
      if (!res.ok) throw new Error();
      await onActivitiesChanged();
    } catch {
      showToast("Failed to update follow-up", "error");
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/jobs/${jobId}/activities/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await onActivitiesChanged();
      showToast("Follow-up removed");
    } catch {
      showToast("Failed to remove follow-up", "error");
    } finally {
      setDeleting(null);
    }
  }

  const incomplete = activities
    .filter((a) => !a.completed)
    .sort((a, b) => {
      if (!a.scheduledAt && !b.scheduledAt) return 0;
      if (!a.scheduledAt) return 1;
      if (!b.scheduledAt) return -1;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });
  const completed = activities
    .filter((a) => a.completed)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  function isOverdue(a: JobActivity) {
    return !!a.scheduledAt && !a.completed && new Date(a.scheduledAt) < new Date();
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-medium text-zinc-50">Follow-ups</h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            + Add follow-up
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-medium text-zinc-200">
            {editingId ? "Edit follow-up" : "Add follow-up"}
          </h3>
          <Input
            id="fu-title"
            label="Task *"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Send thank-you email to recruiter"
          />
          <DatePicker
            id="fu-due"
            label="Due date"
            value={form.scheduledAt}
            onChange={(v) => setForm((prev) => ({ ...prev, scheduledAt: v }))}
            placeholder="Select date and time"
            includeTime
          />
          <Textarea
            id="fu-notes"
            label="Notes"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional notes..."
            rows={2}
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
              {saving ? "Saving..." : editingId ? "Save changes" : "Add follow-up"}
            </button>
          </div>
        </div>
      )}

      {activities.length === 0 && !showForm ? (
        <p className="text-sm text-zinc-500 text-center py-8">
          No follow-ups yet. Add one to stay on top of next steps.
        </p>
      ) : (
        <div className="space-y-4">
          {incomplete.length > 0 && (
            <div className="space-y-2">
              {incomplete.map((activity) => (
                <FollowUpRow
                  key={activity.id}
                  activity={activity}
                  overdue={isOverdue(activity)}
                  toggling={toggling === activity.id}
                  deleting={deleting === activity.id}
                  onToggle={() => handleToggleComplete(activity)}
                  onEdit={() => startEdit(activity)}
                  onDelete={() => handleDelete(activity.id)}
                />
              ))}
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-2 mt-4">Completed</p>
              <div className="space-y-2 opacity-60">
                {completed.map((activity) => (
                  <FollowUpRow
                    key={activity.id}
                    activity={activity}
                    overdue={false}
                    toggling={toggling === activity.id}
                    deleting={deleting === activity.id}
                    onToggle={() => handleToggleComplete(activity)}
                    onEdit={() => startEdit(activity)}
                    onDelete={() => handleDelete(activity.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FollowUpRow({
  activity,
  overdue,
  toggling,
  deleting,
  onToggle,
  onEdit,
  onDelete,
}: {
  activity: JobActivity;
  overdue: boolean;
  toggling: boolean;
  deleting: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex items-start gap-3 bg-zinc-800 border rounded-lg px-4 py-3 ${overdue ? "border-red-900/60" : "border-zinc-700"}`}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={toggling}
        aria-label={activity.completed ? "Mark incomplete" : "Mark complete"}
        className={`mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
          activity.completed
            ? "bg-indigo-500 border-indigo-500"
            : "border-zinc-500 hover:border-indigo-400"
        } disabled:opacity-50`}
      >
        {activity.completed && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="2 6 5 9 10 3" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${activity.completed ? "line-through text-zinc-500" : "text-zinc-200"}`}
        >
          {activity.title}
        </p>
        {activity.scheduledAt && (
          <p className={`text-xs mt-0.5 ${overdue ? "text-red-400" : "text-zinc-400"}`}>
            {overdue ? "Overdue · " : "Due "}
            {new Date(activity.scheduledAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
        {activity.description && (
          <p className="text-xs text-zinc-400 mt-1">{activity.description}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-zinc-400 hover:text-zinc-50 px-2 py-1 rounded hover:bg-zinc-700 transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {deleting ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
