"use client";

import type { Experience } from "@/types/profile";

type ExperienceSectionProps = {
  experiences: Experience[];
  onUpdate: (experiences: Experience[]) => void;
};

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
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-50">Experience</h2>
        <button
          type="button"
          onClick={handleAddExperience}
          className="rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-700"
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
                  <label className="mb-1 block text-sm text-zinc-400">
                    Title
                  </label>
                  <input
                    value={experience.title}
                    onChange={(e) =>
                      handleChange(index, "title", e.target.value)
                    }
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
                    placeholder="Job title"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-400">
                    Organization
                  </label>
                  <input
                    value={experience.organization ?? ""}
                    onChange={(e) =>
                      handleChange(index, "organization", e.target.value)
                    }
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
                    placeholder="Company"
                  />
                </div>

                {/* ✅ FIXED DATE INPUT */}
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={experience.startDate ?? ""}
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
                    value={experience.endDate ?? ""}
                    onChange={(e) =>
                      handleChange(index, "endDate", e.target.value)
                    }
                    disabled={experience.isCurrent}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-sm text-zinc-400">
                  Description
                </label>
                <textarea
                  value={experience.description ?? ""}
                  onChange={(e) =>
                    handleChange(index, "description", e.target.value)
                  }
                  rows={4}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
                  placeholder="Describe your work"
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