"use client";

import { useState } from "react";
import type { Job, JobStage } from "@/types/job";

type JobFormProps = {
  initialValues?: Job | null;
  onSubmit: (job: Job) => void;
  onCancel: () => void;
};

const STAGES: JobStage[] = ["Interested", "Applied", "Interview", "Offer", "Rejected", "Archived"];

export default function JobForm({ initialValues, onSubmit, onCancel }: JobFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [company, setCompany] = useState(initialValues?.company ?? "");
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [stage, setStage] = useState<JobStage>(initialValues?.stage ?? ("Interested" as JobStage));
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
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="title">
          Job Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          placeholder="Software Engineer Intern"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="company">
          Company
        </label>
        <input
          id="company"
          type="text"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          placeholder="Google"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="location">
          Location
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          placeholder="Mountain View, CA"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="stage">
          Stage
        </label>
        <select
          id="stage"
          value={stage}
          onChange={(event) => setStage(event.target.value as JobStage)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        >
          {STAGES.map((jobStage) => (
            <option key={jobStage} value={jobStage}>
              {jobStage}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="lastActivityDate">
          Last Activity Date
        </label>
        <input
          id="lastActivityDate"
          type="date"
          value={lastActivityDate}
          onChange={(event) => setLastActivityDate(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={priority}
          onChange={(event) => setPriority(event.target.checked)}
        />
        Mark as priority
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          {initialValues ? "Update Job" : "Add Job"}
        </button>
      </div>
    </form>
  );
}
