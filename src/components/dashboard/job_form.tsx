"use client";

import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import type { Job, JobStage } from "@/types/job";

type JobFormProps = {
  initialValues?: Job | null;
  onSubmit: (job: Job) => void;
  onCancel: () => void;
};

const STAGES: JobStage[] = ["Interested", "Applied", "Interview", "Offer", "Rejected", "Archived"];

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !company.trim()) {
      return;
    }

    onSubmit({
      id: initialValues?.id ?? crypto.randomUUID(),
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      stage,
      lastActivityDate,
      priority,
    });
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
        id="lastActivityDate"
        label="Last Activity Date"
        value={lastActivityDate}
        onChange={setLastActivityDate}
        placeholder="Select date"
        required
      />

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
          className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
        >
          {initialValues ? "Update Job" : "Add Job"}
        </button>
      </div>
    </form>
  );
}
