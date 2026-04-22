"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { Skill } from "@/types/profile";

type SkillFormProps = {
  skill?: Skill;
  existingNames: string[];
  onSave: (skill: Skill) => void;
  onCancel: () => void;
};

type FormErrors = {
  name?: string;
};

const PROFICIENCY_OPTIONS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
] as const;

export function SkillForm({ skill, existingNames, onSave, onCancel }: SkillFormProps) {
  const [name, setName] = useState(skill?.name ?? "");
  const [category, setCategory] = useState(skill?.category ?? "");
  const [proficiency, setProficiency] = useState(skill?.proficiency ?? "");
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!name.trim()) e.name = "Skill name is required";
    else {
      const normalizedName = name.trim().toLowerCase();
      const currentName = skill?.name?.trim().toLowerCase();
      const isEditingSame = currentName && normalizedName === currentName;
      if (!isEditingSame && existingNames.some((n) => n.toLowerCase() === normalizedName)) {
        e.name = "A skill with this name already exists";
      }
    }
    return e;
  }

  function handleSave() {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    onSave({
      id: skill?.id ?? "",
      name: name.trim(),
      category: category.trim(),
      proficiency: proficiency.trim(),
    });
  }

  const isValid = name.trim().length > 0;

  return (
    <div className="space-y-4">
      <Input
        id="skill-name"
        label="Skill Name"
        placeholder="e.g. React, Python, AutoCAD"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
      />

      <Input
        id="skill-category"
        label="Category"
        placeholder="e.g. Frontend, Backend, Design"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <div className="space-y-1">
        <label
          htmlFor="skill-proficiency"
          className="text-sm font-medium text-zinc-200"
        >
          Proficiency
        </label>
        <select
          id="skill-proficiency"
          value={proficiency}
          onChange={(e) => setProficiency(e.target.value)}
          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none transition-colors focus:border-indigo-500"
        >
          <option value="">Select proficiency (optional)</option>
          {PROFICIENCY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid}
          className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}