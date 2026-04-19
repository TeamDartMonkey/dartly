"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/ui/toast";
import { STAGES } from "@/constants/job-stages";
import type { Job, JobStage } from "@/types/job";

interface Props {
  job: Job;
  onJobUpdated: (job: Job) => void;
}

export function OverviewSection({ job, onJobUpdated }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: job.title,
    company: job.company,
    location: job.location ?? "",
    description: job.description ?? "",
    compensationNotes: job.compensationNotes ?? "",
    applicationDate: job.applicationDate ? job.applicationDate.slice(0, 10) : "",
    deadline: job.deadline ? job.deadline.slice(0, 10) : "",
    recruiterNotes: job.recruiterNotes ?? "",
    customNotes: job.customNotes ?? "",
    priority: job.priority ?? false,
    stage: job.stage,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleStageChange(newStage: JobStage) {
    setForm((prev) => ({ ...prev, stage: newStage }));
  }

  function handleCancel() {
    setForm({
      title: job.title,
      company: job.company,
      location: job.location ?? "",
      description: job.description ?? "",
      compensationNotes: job.compensationNotes ?? "",
      applicationDate: job.applicationDate ? job.applicationDate.slice(0, 10) : "",
      deadline: job.deadline ? job.deadline.slice(0, 10) : "",
      recruiterNotes: job.recruiterNotes ?? "",
      customNotes: job.customNotes ?? "",
      priority: job.priority ?? false,
      stage: job.stage,
    });
    setEditing(false);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      showToast("Job title is required", "error");
      return;
    }
    if (!form.company.trim()) {
      showToast("Company is required", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          company: form.company.trim(),
          location: form.location.trim() || null,
          description: form.description.trim() || null,
          compensationNotes: form.compensationNotes.trim() || null,
          applicationDate: form.applicationDate || null,
          deadline: form.deadline || null,
          recruiterNotes: form.recruiterNotes.trim() || null,
          customNotes: form.customNotes.trim() || null,
          priority: form.priority,
          stage: form.stage,
        }),
      });
      if (!res.ok) {
        showToast("Failed to save changes", "error");
        return;
      }
      const updated: Job = await res.json();
      onJobUpdated(updated);
      setEditing(false);
      showToast("Changes saved");
    } catch {
      showToast("Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-medium text-zinc-50">Overview</h2>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md text-sm disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field
            label="Job title *"
            id="title"
            name="title"
            value={form.title}
            editing={editing}
            onChange={handleChange}
          />
          <Field
            label="Company *"
            id="company"
            name="company"
            value={form.company}
            editing={editing}
            onChange={handleChange}
          />
          <div>
            <label htmlFor="stage" className="block text-xs font-medium text-zinc-400 mb-1">
              Stage
            </label>
            {editing ? (
              <Select
                id="stage"
                value={form.stage}
                onChange={(val) => handleStageChange(val as JobStage)}
                options={STAGES.map((s) => ({ value: s, label: s }))}
              />
            ) : (
              <p className="text-sm text-zinc-300 py-2 min-h-[36px]">{form.stage}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Location"
            id="location"
            name="location"
            value={form.location}
            editing={editing}
            onChange={handleChange}
            placeholder="City, State or Remote"
          />
          <Field
            label="Application date"
            id="applicationDate"
            name="applicationDate"
            value={form.applicationDate}
            editing={editing}
            onChange={handleChange}
            type="date"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Deadline"
            id="deadline"
            name="deadline"
            value={form.deadline}
            editing={editing}
            onChange={handleChange}
            type="date"
          />
          <Field
            label="Compensation notes"
            id="compensationNotes"
            name="compensationNotes"
            value={form.compensationNotes}
            editing={editing}
            onChange={handleChange}
            placeholder="e.g. $120k + equity"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <span className="block text-xs font-medium text-zinc-400 mb-1">Priority</span>
            {editing ? (
              <label className="flex items-center gap-2 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.priority}
                  onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.checked }))}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-sm text-zinc-300">Mark as priority</span>
              </label>
            ) : (
              <p className="text-sm text-zinc-300 py-2 min-h-[36px]">
                {form.priority ? "Yes" : <span className="text-zinc-600 italic">No</span>}
              </p>
            )}
          </div>
        </div>

        <TextareaField
          label="Job description"
          id="description"
          name="description"
          value={form.description}
          editing={editing}
          onChange={handleChange}
          placeholder="Paste the job description here..."
          rows={6}
        />

        <TextareaField
          label="Recruiter / contact notes"
          id="recruiterNotes"
          name="recruiterNotes"
          value={form.recruiterNotes}
          editing={editing}
          onChange={handleChange}
          placeholder="Recruiter name, email, phone, LinkedIn..."
          rows={3}
        />

        <TextareaField
          label="Notes"
          id="customNotes"
          name="customNotes"
          value={form.customNotes}
          editing={editing}
          onChange={handleChange}
          placeholder="Personal notes, links, reminders..."
          rows={3}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  name,
  value,
  editing,
  onChange,
  type = "text",
  placeholder = "",
}: {
  label: string;
  id: string;
  name: string;
  value: string;
  editing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}) {
  if (!editing) {
    return (
      <div>
        <label htmlFor={id} className="block text-xs font-medium text-zinc-400 mb-1">
          {label}
        </label>
        <p className="text-sm text-zinc-300 py-2 min-h-[36px]">
          {value || <span className="text-zinc-600 italic">Not set</span>}
        </p>
      </div>
    );
  }
  return (
    <Input
      id={id}
      label={label}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}

function TextareaField({
  label,
  id,
  name,
  value,
  editing,
  onChange,
  placeholder = "",
  rows = 4,
}: {
  label: string;
  id: string;
  name: string;
  value: string;
  editing: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) {
  if (!editing) {
    return (
      <div>
        <label htmlFor={id} className="block text-xs font-medium text-zinc-400 mb-1">
          {label}
        </label>
        <p className="text-sm text-zinc-300 whitespace-pre-wrap min-h-[36px] py-1">
          {value || <span className="text-zinc-600 italic">Not set</span>}
        </p>
      </div>
    );
  }
  return (
    <Textarea
      id={id}
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
    />
  );
}
