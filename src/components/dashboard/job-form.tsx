"use client";

import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import type { Job, JobStage } from "@/types/job";

type JobFormProps = {
  initialValues?: Job | null;
  onSubmit: (job: Omit<Job, "id" | "createdAt"> & { id?: string }) => void | Promise<void>;
  onCancel: () => void;
};

const STAGES: JobStage[] = ["Interested", "Applied", "Interview", "Offer", "Rejected"];

const inputStyles =
  "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

const labelStyles = "mb-1 block text-sm font-medium text-zinc-300";

export default function JobForm({ initialValues, onSubmit, onCancel }: JobFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [company, setCompany] = useState(initialValues?.company ?? "");
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [stage, setStage] = useState<JobStage>(initialValues?.stage ?? "Interested");
  const [lastActivityDate, setLastActivityDate] = useState(
    initialValues?.lastActivityDate ?? new Date().toISOString().slice(0, 10)
  );
  const [priority, setPriority] = useState(initialValues?.priority ?? false);
  const [deadline, setDeadline] = useState(initialValues?.deadline ?? "");
  const [customNotes, setCustomNotes] = useState(initialValues?.customNotes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;
    if (!title.trim() || !company.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: initialValues?.id,
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        stage,
        lastActivityDate,
        priority,
        deadline: deadline || undefined,
        customNotes: customNotes.trim() || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className={labelStyles} htmlFor="title">
          Job Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputStyles}
          placeholder="Software Engineer Intern"
          required
        />
      </div>

      <div>
        <label className={labelStyles} htmlFor="company">
          Company
        </label>
        <input
          id="company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className={inputStyles}
          placeholder="Google"
          required
        />
      </div>

      <div>
        <label className={labelStyles} htmlFor="location">
          Location
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={inputStyles}
          placeholder="Mountain View, CA"
        />
      </div>

      <div>
        <label className={labelStyles} htmlFor="stage">
          Stage
        </label>
        <Select
          id="stage"
          value={stage}
          onChange={(val) => setStage(val as JobStage)}
          options={STAGES.map((s) => ({ value: s, label: s }))}
        />
      </div>

      <DatePicker
        id="deadline"
        label="Deadline"
        value={deadline}
        onChange={setDeadline}
        placeholder="Select deadline"
      />

      <DatePicker
        id="lastActivityDate"
        label="Last Activity Date"
        value={lastActivityDate}
        onChange={setLastActivityDate}
        placeholder="Select date"
        required
      />

      <div>
        <label className={labelStyles} htmlFor="customNotes">
          Notes
        </label>
        <textarea
          id="customNotes"
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
          className={`${inputStyles} resize-none`}
          placeholder="Any notes about this application..."
          rows={3}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={priority}
          onChange={(e) => setPriority(e.target.checked)}
          className="accent-indigo-500"
        />
        Mark as priority
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
