"use client";

import type { Skill } from "@/types/profile";

type SkillsSectionProps = {
  skills: Skill[];
  onUpdate: (skills: Skill[]) => void;
};

const inputStyles =
  "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

const labelStyles = "mb-1 block text-xs font-medium text-zinc-400";

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
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-50">Skills</h2>
        <button
          type="button"
          onClick={handleAddSkill}
          className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
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
                  <label className={labelStyles} htmlFor={`skill-name-${index}`}>
                    Skill Name
                  </label>
                  <input
                    id={`skill-name-${index}`}
                    value={skill.name}
                    onChange={(e) => handleChange(index, "name", e.target.value)}
                    className={inputStyles}
                    placeholder="e.g. AutoCAD"
                  />
                </div>

                <div>
                  <label className={labelStyles} htmlFor={`skill-category-${index}`}>
                    Category
                  </label>
                  <input
                    id={`skill-category-${index}`}
                    value={skill.category ?? ""}
                    onChange={(e) => handleChange(index, "category", e.target.value)}
                    className={inputStyles}
                    placeholder="e.g. Technical"
                  />
                </div>

                <div>
                  <label className={labelStyles} htmlFor={`skill-proficiency-${index}`}>
                    Proficiency
                  </label>
                  <input
                    id={`skill-proficiency-${index}`}
                    value={skill.proficiency ?? ""}
                    onChange={(e) => handleChange(index, "proficiency", e.target.value)}
                    className={inputStyles}
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