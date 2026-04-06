"use client";

import type { Education } from "@/types/profile";

type EducationSectionProps = {
  educations: Education[];
  onUpdate: (educations: Education[]) => void;
};

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
      id: crypto.randomUUID(),
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
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-50">Education</h2>
        <button
          type="button"
          onClick={handleAddEducation}
          className="rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-700"
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
                  <label className="mb-1 block text-sm text-zinc-400">
                    Institution
                  </label>
                  <input
                    value={education.institution}
                    onChange={(e) =>
                      handleChange(index, "institution", e.target.value)
                    }
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
                    placeholder="e.g. NJIT"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-400">
                    Degree
                  </label>
                  <input
                    value={education.degree ?? ""}
                    onChange={(e) =>
                      handleChange(index, "degree", e.target.value)
                    }
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
                    placeholder="e.g. Bachelor's"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-400">
                    Field of Study
                  </label>
                  <input
                    value={education.fieldOfStudy ?? ""}
                    onChange={(e) =>
                      handleChange(index, "fieldOfStudy", e.target.value)
                    }
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
                    placeholder="e.g. Concrete Industry Management"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-400">
                    GPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={education.gpa ?? ""}
                    onChange={(e) => handleChange(index, "gpa", e.target.value)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
                    placeholder="e.g. 3.50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-400">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={education.startDate ?? ""}
                    onChange={(e) =>
                      handleChange(index, "startDate", e.target.value)
                    }
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-400">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={education.endDate ?? ""}
                    onChange={(e) =>
                      handleChange(index, "endDate", e.target.value)
                    }
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-sm text-zinc-400">
                  Honors
                </label>
                <input
                  value={education.honors ?? ""}
                  onChange={(e) =>
                    handleChange(index, "honors", e.target.value)
                  }
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
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