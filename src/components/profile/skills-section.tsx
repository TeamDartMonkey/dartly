"use client";

import { useState, type DragEvent } from "react";
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

  function handleCloseModal() {
    setModalOpen(false);
    setEditingIndex(null);
  }

  function confirmDelete() {
    if (deleteIndex === null) return;

    onUpdate(
      skills.filter((_, i) => i !== deleteIndex),
      "Skill removed"
    );

    setDeleteIndex(null);
  }

  function handleSave(skill: Skill) {
    if (editingIndex !== null) {
      const updated = skills.map((s, i) =>
        i === editingIndex ? skill : s
      );
      onUpdate(updated, "Skill updated");
    } else {
      onUpdate([...skills, skill], "Skill added");
    }

    handleCloseModal();
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: DragEvent<HTMLLIElement>, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(index: number) {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...skills];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, moved);

    onUpdate(updated, "Skills reordered");

    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  const deleteItem = deleteIndex !== null ? skills[deleteIndex] : null;

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-zinc-50">Skills</h2>

      {skills.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-700 py-8">
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
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill, index) => {
            const isDragging = draggedIndex === index;
            const isDragTarget =
              dragOverIndex === index && draggedIndex !== index;

            return (
                <li
                  key={skill.id || index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={[
                    "group list-none rounded-lg border px-3 py-2 transition-colors",
                    isDragging
                      ? "border-indigo-500 bg-zinc-800 opacity-50"
                      : isDragTarget
                      ? "border-indigo-400 bg-zinc-800"
                      : "border-zinc-700 bg-zinc-800 hover:border-zinc-600",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(index)}
                      className="text-left"
                    >
                      <div className="text-sm text-zinc-200">
                        {skill.name || (
                          <span className="text-zinc-600">Unnamed</span>
                        )}
                      </div>

                      {(skill.category || skill.proficiency) && (
                        <div className="text-xs text-zinc-400">
                          {[skill.category, skill.proficiency]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                      )}
                    </button>

                    <span
                      className="cursor-grab select-none px-1 text-zinc-500"
                      title="Drag to reorder"
                      aria-hidden="true"
                    >
                      ⋮⋮
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(index);
                      }}
                      className="text-zinc-600 hover:text-red-400"
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </li>
            );
          })}

          <li className="list-none">
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-lg border border-dashed border-zinc-700 px-3 py-1.5 text-sm text-indigo-400 hover:border-zinc-600 hover:text-indigo-300"
            >
              + Add skill
            </button>
          </li>
        </ul>
      )}

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingIndex !== null ? "Edit Skill" : "Add Skill"}
      >
        <SkillForm
          key={editingIndex ?? "new"}
          skill={editingIndex !== null ? skills[editingIndex] : undefined}
          onSave={handleSave}
          onCancel={handleCloseModal}
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