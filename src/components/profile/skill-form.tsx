"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { Skill } from "@/types/profile";

type SkillFormProps = {
  skill?: Skill;
  onSave: (skill: Skill) => void;
  onCancel: () => void;
};

type FormErrors = {
  name?: string;
};

export function SkillForm({ skill, onSave, onCancel }: SkillFormProps) {
  const [name, setName] = useState(skill?.name ?? "");
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!name.trim()) e.name = "Skill name is required";
    return e;
  }

  function handleSave() {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    onSave({
      id: skill?.id ?? "",
      name: name.trim(),
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
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
        >
          Save
        </button>
      </div>
    </div>
  );
}
