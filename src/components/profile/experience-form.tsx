"use client";

import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Experience } from "@/types/profile";

type ExperienceFormProps = {
  experience?: Experience;
  onSave: (experience: Experience) => void;
  onCancel: () => void;
};

type FormErrors = {
  title?: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

const EXPERIENCE_TYPE_OPTIONS = [
  { value: "EMPLOYMENT", label: "Employment" },
  { value: "PROJECT", label: "Project" },
];

function validate(values: {
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
}): FormErrors {
  const errors: FormErrors = {};

  if (!values.title.trim()) {
    errors.title = "Title is required";
  }

  if (!values.organization.trim()) {
    errors.organization = "Organization is required";
  }

  if (!values.startDate) {
    errors.startDate = "Start date is required";
  }

  if (!values.isCurrent && values.endDate) {
    if (values.startDate && new Date(values.endDate) < new Date(values.startDate)) {
      errors.endDate = "End date must be after start date";
    }
  }

  if (!values.description.trim()) {
    errors.description = "Description is required";
  }

  return errors;
}

export function ExperienceForm({ experience, onSave, onCancel }: ExperienceFormProps) {
  const [type, setType] = useState<Experience["type"]>(experience?.type ?? "EMPLOYMENT");
  const [title, setTitle] = useState(experience?.title ?? "");
  const [organization, setOrganization] = useState(experience?.organization ?? "");
  const [startDate, setStartDate] = useState(experience?.startDate ?? "");
  const [endDate, setEndDate] = useState(experience?.endDate ?? "");
  const [isCurrent, setIsCurrent] = useState(experience?.isCurrent ?? false);
  const [description, setDescription] = useState(experience?.description ?? "");
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate({
      title,
      organization,
      startDate,
      endDate,
      isCurrent,
      description,
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      id: experience?.id ?? "",
      type,
      title: title.trim(),
      organization: organization.trim(),
      startDate: startDate,
      endDate: isCurrent ? undefined : endDate,
      isCurrent,
      description: description.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="experience-type" className="mb-1 block text-xs font-medium text-zinc-400">
          Type
        </label>
        <Select
          id="experience-type"
          options={EXPERIENCE_TYPE_OPTIONS}
          value={type}
          onChange={(v) => setType(v as Experience["type"])}
          placeholder="Select type"
        />
      </div>

      <Input
        id="experience-title"
        label="Title"
        placeholder={type === "EMPLOYMENT" ? "e.g. Software Engineer" : "e.g. Portfolio Site"}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
        }}
        error={errors.title}
        required
      />

      <Input
        id="experience-organization"
        label="Organization"
        placeholder={type === "EMPLOYMENT" ? "e.g. Acme Corp" : "e.g. Open Source"}
        value={organization}
        onChange={(e) => {
          setOrganization(e.target.value);
          if (errors.organization) setErrors((prev) => ({ ...prev, organization: undefined }));
        }}
        error={errors.organization}
        required
      />

      <div>
        <label
          htmlFor="experience-current"
          className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer"
        >
          <input
            id="experience-current"
            type="checkbox"
            checked={isCurrent}
            onChange={(e) => {
              setIsCurrent(e.target.checked);
              if (e.target.checked) setEndDate("");
            }}
            className="rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
          />
          I currently work here
        </label>
      </div>

      <DatePicker
        id="experience-start-date"
        label="Start Date"
        value={startDate}
        onChange={(v) => {
          setStartDate(v);
          if (errors.startDate) setErrors((prev) => ({ ...prev, startDate: undefined }));
        }}
        error={errors.startDate}
        placeholder="Start date"
        required
      />

      {!isCurrent && (
        <DatePicker
          id="experience-end-date"
          label="End Date"
          value={endDate}
          onChange={(v) => {
            setEndDate(v);
            if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: undefined }));
          }}
          error={errors.endDate}
          placeholder="End date"
          minDate={startDate || undefined}
          required
        />
      )}

      <Textarea
        id="experience-description"
        label="Description"
        placeholder="Brief description of your role or project..."
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
        }}
        error={errors.description}
        rows={4}
        required
      />

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          Save
        </button>
      </div>
    </form>
  );
}
