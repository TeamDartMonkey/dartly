"use client";

import type { Skill } from "@/types/profile";

type SkillsSectionProps = {
  skills: Skill[];
  onUpdate: (skills: Skill[]) => void;
};

export function SkillsSection({ skills, onUpdate }: SkillsSectionProps) {
  function handleAddSkill() {
    const newSkill: Skill = {
      id: "",
      name: "",
      category: "",
      proficiency: "",
    };

    onUpdate([...skills, newSkill]);
  }

  function handleChange(index: number, field: keyof Skill, value: string) {
    const updated = skills.map((skill, i) =>
      i === index ? { ...skill, [field]: value } : skill
    );
    onUpdate(updated);
  }

  function handleDelete(index: number) {
    onUpdate(skills.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-50">Skills</h2>
        <button
          type="button"
          onClick={handleAddSkill}
          className="rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-700"
        >
          Add
        </button>
      </div>

      {skills.length === 0 ? (
        <p className="text-sm text-zinc-500">No skills added yet.</p>
      ) : (
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div
              key={skill.id}
              className="rounded-md border border-zinc-700 bg-zinc-950/40 p-4"
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">
                    Skill Name
                  </label>
                  <input
                    value={skill.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
                    placeholder="e.g. AutoCAD"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-400">
                    Category
                  </label>
                  <input
                    value={skill.category ?? ""}
                    onChange={(e) =>
                      handleChange(index, "category", e.target.value)
                    }
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
                    placeholder="e.g. Technical"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-400">
                    Proficiency
                  </label>
                  <input
                    value={skill.proficiency ?? ""}
                    onChange={(e) =>
                      handleChange(index, "proficiency", e.target.value)
                    }
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-zinc-500"
                    placeholder="e.g. Intermediate"
                  />
                </div>
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