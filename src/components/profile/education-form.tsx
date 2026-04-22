"use client";

import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import type { Education } from "@/types/profile";

type EducationFormProps = {
  education?: Education;
  onSave: (education: Education) => void;
  onCancel: () => void;
};

type FormErrors = {
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
};

function validate(values: {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: string;
}): FormErrors {
  const errors: FormErrors = {};

  if (!values.institution.trim()) errors.institution = "Institution is required";
  if (!values.degree.trim()) errors.degree = "Degree is required";
  if (!values.fieldOfStudy.trim()) errors.fieldOfStudy = "Field of study is required";
  if (!values.startDate) {
    errors.startDate = "Start date is required";
  }

  if (!values.endDate) {
    errors.endDate = "End date is required";
  }

  if (values.startDate && values.endDate && !errors.startDate && !errors.endDate) {
    if (new Date(values.endDate) < new Date(values.startDate)) {
      errors.endDate = "End date must be after start date";
    }
  }

  if (!values.gpa.trim()) {
    errors.gpa = "GPA is required";
  } else {
    const num = Number(values.gpa);
    if (Number.isNaN(num) || num < 0) {
      errors.gpa = "GPA must be a non-negative number";
    }
  }

  return errors;
}

export function EducationForm({ education, onSave, onCancel }: EducationFormProps) {
  const [institution, setInstitution] = useState(education?.institution ?? "");
  const [degree, setDegree] = useState(education?.degree ?? "");
  const [fieldOfStudy, setFieldOfStudy] = useState(education?.fieldOfStudy ?? "");
  const [startDate, setStartDate] = useState(education?.startDate ?? "");
  const [endDate, setEndDate] = useState(education?.endDate ?? "");
  const [gpa, setGpa] = useState(education?.gpa ?? "");
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate({
      institution,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      gpa,
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      id: education?.id ?? "",
      institution: institution.trim(),
      degree: degree.trim(),
      fieldOfStudy: fieldOfStudy.trim(),
      startDate,
      endDate,
      gpa: gpa.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="education-institution"
        label="Institution"
        placeholder="e.g. NJIT"
        value={institution}
        onChange={(e) => {
          setInstitution(e.target.value);
          if (errors.institution) setErrors((prev) => ({ ...prev, institution: undefined }));
        }}
        error={errors.institution}
        required
      />

      <Input
        id="education-degree"
        label="Degree"
        placeholder="e.g. Bachelor's"
        value={degree}
        onChange={(e) => {
          setDegree(e.target.value);
          if (errors.degree) setErrors((prev) => ({ ...prev, degree: undefined }));
        }}
        error={errors.degree}
        required
      />

      <Input
        id="education-field-of-study"
        label="Field of Study"
        placeholder="e.g. Computer Science"
        value={fieldOfStudy}
        onChange={(e) => {
          setFieldOfStudy(e.target.value);
          if (errors.fieldOfStudy) setErrors((prev) => ({ ...prev, fieldOfStudy: undefined }));
        }}
        error={errors.fieldOfStudy}
        required
      />

      <DatePicker
        id="education-start-date"
        label="Start Date"
        value={startDate}
        onChange={(v) => {
          setStartDate(v);
          if (errors.startDate) setErrors((prev) => ({ ...prev, startDate: undefined }));
          if (v && endDate && new Date(v) > new Date(endDate)) {
            setEndDate("");
          }
        }}
        error={errors.startDate}
        placeholder="Start date"
        maxDate={endDate || undefined}
        required
      />

      <DatePicker
        id="education-end-date"
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

      <Input
        id="education-gpa"
        label="GPA"
        placeholder="e.g. 3.50"
        value={gpa}
        onChange={(e) => {
          setGpa(e.target.value);
          if (errors.gpa) setErrors((prev) => ({ ...prev, gpa: undefined }));
        }}
        error={errors.gpa}
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
