"use client";

import type { Education } from "@/types/profile";

type EducationSectionProps = {
  educations: Education[];
  onUpdate: (educations: Education[]) => void;
};

const inputStyles =
  "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

const labelStyles = "mb-1 block text-xs font-medium text-zinc-400";

function isValidGpa(value: string) {
  if (value === "") return true;
  const num = Number(value);
  return !Number.isNaN(num) && num >= 0;
}

function isValidDateRange(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return true;
  return new Date(endDate) >= new Date(startDate);
}

export function EducationSection({
  educations,
  onUpdate,
}: EducationSectionProps) {
  function handleAddEducation() {
    const newEducation: Education = {
      id: "",
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      gpa: "",
      honors: "",
    };

    onUpdate([...educations, newEducation]);
  }

  function handleChange(index: number, field: keyof Education, value: string) {
    const current = educations[index];

    if (field === "gpa" && !isValidGpa(value)) {
      return;
    }

    const updatedItem: Education = {
      ...current,
      [field]: value,
    };

    const nextStartDate =
      field === "startDate" ? value : (updatedItem.startDate ?? "");
    const nextEndDate =
      field === "endDate" ? value : (updatedItem.endDate ?? "");

    if (!isValidDateRange(nextStartDate, nextEndDate)) {
      return;
    }

    const updated = educations.map((education, i) =>
      i === index ? updatedItem : education
    );

    onUpdate(updated);
  }

  function handleDelete(index: number) {
    onUpdate(educations.filter((_, i) => i !== index));
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-50">Education</h2>
        <button
          type="button"
          onClick={handleAddEducation}
          className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
        >
          Add
        </button>
      </div>

      {educations.length === 0 ? (
        <p className="text-sm text-zinc-500">No education added yet.</p>
      ) : (
        <div className="space-y-4">
          {educations.map((education, index) => (
            <div
              key={education.id}
              className="rounded-md border border-zinc-700 bg-zinc-950/40 p-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelStyles} htmlFor={`education-institution-${index}`}>
                    Institution
                  </label>
                  <input
                    id={`education-institution-${index}`}
                    value={education.institution}
                    onChange={(e) =>
                      handleChange(index, "institution", e.target.value)
                    }
                    className={inputStyles}
                    placeholder="e.g. NJIT"
                  />
                </div>

                <div>
                  <label className={labelStyles} htmlFor={`education-degree-${index}`}>
                    Degree
                  </label>
                  <input
                    id={`education-degree-${index}`}
                    value={education.degree ?? ""}
                    onChange={(e) => handleChange(index, "degree", e.target.value)}
                    className={inputStyles}
                    placeholder="e.g. Bachelor's"
                  />
                </div>

                <div>
                  <label className={labelStyles} htmlFor={`education-field-${index}`}>
                    Field of Study
                  </label>
                  <input
                    id={`education-field-${index}`}
                    value={education.fieldOfStudy ?? ""}
                    onChange={(e) =>
                      handleChange(index, "fieldOfStudy", e.target.value)
                    }
                    className={inputStyles}
                    placeholder="e.g. Concrete Industry Management"
                  />
                </div>

                <div>
                  <label className={labelStyles} htmlFor={`education-gpa-${index}`}>
                    GPA
                  </label>
                  <input
                    id={`education-gpa-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={education.gpa ?? ""}
                    onChange={(e) => handleChange(index, "gpa", e.target.value)}
                    className={inputStyles}
                    placeholder="e.g. 3.50"
                  />
                </div>

                <div>
                  <label className={labelStyles} htmlFor={`education-start-date-${index}`}>
                    Start Date
                  </label>
                  <input
                    id={`education-start-date-${index}`}
                    type="date"
                    value={education.startDate ?? ""}
                    onChange={(e) =>
                      handleChange(index, "startDate", e.target.value)
                    }
                    className={inputStyles}
                  />
                </div>

                <div>
                  <label className={labelStyles} htmlFor={`education-end-date-${index}`}>
                    End Date
                  </label>
                  <input
                    id={`education-end-date-${index}`}
                    type="date"
                    value={education.endDate ?? ""}
                    onChange={(e) => handleChange(index, "endDate", e.target.value)}
                    className={inputStyles}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className={labelStyles} htmlFor={`education-honors-${index}`}>
                  Honors
                </label>
                <input
                  id={`education-honors-${index}`}
                  value={education.honors ?? ""}
                  onChange={(e) => handleChange(index, "honors", e.target.value)}
                  className={inputStyles}
                  placeholder="e.g. Dean's List"
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-300 hover:bg-red-900/40"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}