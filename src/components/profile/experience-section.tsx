"use client";

import type { Experience } from "@/types/profile";

type ExperienceSectionProps = {
  experiences: Experience[];
  onUpdate: (experiences: Experience[]) => void;
};

const inputStyles =
  "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

const labelStyles = "mb-1 block text-xs font-medium text-zinc-400";

export function ExperienceSection({
  experiences,
  onUpdate,
}: ExperienceSectionProps) {
  function handleAddExperience() {
    const newExperience: Experience = {
      id: "",
      type: "EMPLOYMENT",
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
      bullets: [],
    };

    onUpdate([...experiences, newExperience]);
  }

  function handleChange(
    index: number,
    field: keyof Experience,
    value: string | boolean | string[]
  ) {
    const updated = experiences.map((experience, i) =>
      i === index ? { ...experience, [field]: value } : experience
    );
    onUpdate(updated);
  }

  function handleDelete(index: number) {
    onUpdate(experiences.filter((_, i) => i !== index));
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-50">Experience</h2>
        <button
          type="button"
          onClick={handleAddExperience}
          className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
        >
          Add
        </button>
      </div>

      {experiences.length === 0 ? (
        <p className="text-sm text-zinc-500">No experience added yet.</p>
      ) : (
        <div className="space-y-4">
          {experiences.map((experience, index) => (
            <div
              key={experience.id}
              className="rounded-md border border-zinc-700 bg-zinc-950/40 p-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelStyles} htmlFor={`experience-title-${index}`}>
                    Title
                  </label>
                  <input
                    id={`experience-title-${index}`}
                    value={experience.title}
                    onChange={(e) => handleChange(index, "title", e.target.value)}
                    className={inputStyles}
                    placeholder="Job title"
                  />
                </div>

                <div>
                  <label className={labelStyles} htmlFor={`experience-organization-${index}`}>
                    Organization
                  </label>
                  <input
                    id={`experience-organization-${index}`}
                    value={experience.organization ?? ""}
                    onChange={(e) =>
                      handleChange(index, "organization", e.target.value)
                    }
                    className={inputStyles}
                    placeholder="Company or organization"
                  />
                </div>

                <div>
                  <label className={labelStyles} htmlFor={`experience-start-date-${index}`}>
                    Start Date
                  </label>
                  <input
                    id={`experience-start-date-${index}`}
                    type="date"
                    value={experience.startDate ?? ""}
                    onChange={(e) =>
                      handleChange(index, "startDate", e.target.value)
                    }
                    className={inputStyles}
                  />
                </div>

                <div>
                  <label className={labelStyles} htmlFor={`experience-end-date-${index}`}>
                    End Date
                  </label>
                  <input
                    id={`experience-end-date-${index}`}
                    type="date"
                    value={experience.endDate ?? ""}
                    onChange={(e) => handleChange(index, "endDate", e.target.value)}
                    disabled={experience.isCurrent}
                    className={inputStyles}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className={labelStyles} htmlFor={`experience-description-${index}`}>
                  Description
                </label>
                <textarea
                  id={`experience-description-${index}`}
                  value={experience.description ?? ""}
                  onChange={(e) =>
                    handleChange(index, "description", e.target.value)
                  }
                  rows={4}
                  className={inputStyles}
                  placeholder="Describe your work or project"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={experience.isCurrent}
                    onChange={(e) =>
                      handleChange(index, "isCurrent", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-900"
                  />
                  Current role
                </label>

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