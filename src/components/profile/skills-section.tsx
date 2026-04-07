"use client";

import { useState } from "react";
import { SkillForm } from "@/components/profile/skill-form";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Modal } from "@/components/ui/modal";
import type { Skill } from "@/types/profile";

type SkillsSectionProps = {
  skills: Skill[];
  onUpdate: (skills: Skill[], message?: string) => void;
};

export function SkillsSection({ skills, onUpdate }: SkillsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  function handleAdd() {
    setEditingIndex(null);
    setModalOpen(true);
  }

  function handleEdit(index: number) {
    setEditingIndex(index);
    setModalOpen(true);
  }

  function handleDelete(index: number) {
    setDeleteIndex(index);
  }

  function confirmDelete() {
    if (deleteIndex === null) return;
    onUpdate(
      skills.filter((_, i) => i !== deleteIndex),
      "Skill removed"
    );
    setDeleteIndex(null);
  }

  const deleteItem = deleteIndex !== null ? skills[deleteIndex] : null;

  function handleSave(skill: Skill) {
    if (editingIndex !== null) {
      const updated = skills.map((s, i) => (i === editingIndex ? skill : s));
      onUpdate(updated, "Skill updated");
    } else {
      onUpdate([...skills, { ...skill, id: crypto.randomUUID() }], "Skill added");
    }
    setModalOpen(false);
    setEditingIndex(null);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-zinc-50 mb-4">Skills</h2>

      {skills.length === 0 ? (
        <div className="border border-dashed border-zinc-700 rounded-lg py-8 flex flex-col items-center gap-2">
          <p className="text-sm text-zinc-500">No skills added yet</p>
          <button
            type="button"
            onClick={handleAdd}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            + Add your first skill
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            // biome-ignore lint/a11y/useSemanticElements: div nests child delete button
            <div
              key={skill.id || index}
              role="button"
              tabIndex={0}
              onClick={() => handleEdit(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleEdit(index);
              }}
              className="inline-flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 hover:border-zinc-600 transition-colors cursor-pointer"
            >
              <span className="text-sm text-zinc-200 leading-tight">
                {skill.name || <span className="text-zinc-600">Unnamed</span>}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(index);
                }}
                className="text-zinc-600 hover:text-red-400 transition-colors"
                aria-label="Remove"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1 border border-dashed border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-indigo-400 hover:text-indigo-300 hover:border-zinc-600 transition-colors"
          >
            + Add skill
          </button>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingIndex !== null ? "Edit Skill" : "Add Skill"}
      >
        <SkillForm
          key={editingIndex ?? "new"}
          skill={editingIndex !== null ? skills[editingIndex] : undefined}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDeleteModal
        open={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={confirmDelete}
        itemName={deleteItem?.name?.trim() || undefined}
      />
    </div>
  );
}
