"use client";

import { useState } from "react";
import { EducationForm } from "@/components/profile/education-form";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Modal } from "@/components/ui/modal";
import type { Education } from "@/types/profile";

type EducationSectionProps = {
  educations: Education[];
  onUpdate: (educations: Education[], message?: string) => void;
};

function formatDate(date: string | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function EducationSection({ educations, onUpdate }: EducationSectionProps) {
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
      educations.filter((_, i) => i !== deleteIndex),
      "Education removed"
    );
    setDeleteIndex(null);
  }

  const deleteItem = deleteIndex !== null ? educations[deleteIndex] : null;

  function handleSave(education: Education) {
    if (editingIndex !== null) {
      const updated = educations.map((edu, i) => (i === editingIndex ? education : edu));
      onUpdate(updated, "Education updated");
    } else {
      onUpdate([...educations, education], "Education added");
    }
    setModalOpen(false);
    setEditingIndex(null);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-zinc-50 mb-4">Education</h2>
      {educations.length === 0 ? (
        <div className="border border-dashed border-zinc-700 rounded-lg py-8 flex flex-col items-center gap-2">
          <p className="text-sm text-zinc-500">No education added yet</p>
          <button
            type="button"
            onClick={handleAdd}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            + Add your first education
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {educations.map((edu, index) => (
            // biome-ignore lint/a11y/useSemanticElements: div needed to nest child buttons
            <div
              key={edu.id || index}
              role="button"
              tabIndex={0}
              className="group rounded-lg border border-zinc-700 bg-zinc-950/40 p-4 hover:border-zinc-600 transition-colors cursor-pointer"
              onClick={() => handleEdit(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleEdit(index);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-50">
                    {edu.degree || <span className="text-zinc-600">No degree</span>}
                    {edu.fieldOfStudy && (
                      <span className="text-zinc-400 font-normal"> in {edu.fieldOfStudy}</span>
                    )}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {edu.institution || <span className="text-zinc-600">No institution</span>}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {[formatDate(edu.startDate), formatDate(edu.endDate)]
                      .filter(Boolean)
                      .join(" - ")}
                  </p>
                  {edu.gpa && (
                    <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded mt-1.5 inline-block">
                      GPA: {edu.gpa}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                    aria-label="Delete"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      role="img"
                      aria-label="Delete"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAdd}
            className="w-full border border-dashed border-zinc-700 rounded-lg py-3 text-sm text-indigo-400 hover:text-indigo-300 hover:border-zinc-600 transition-colors"
          >
            + Add education
          </button>
        </div>
      )}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingIndex !== null ? "Edit Education" : "Add Education"}
      >
        <EducationForm
          key={editingIndex ?? "new"}
          education={editingIndex !== null ? educations[editingIndex] : undefined}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDeleteModal
        open={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={confirmDelete}
        itemName={
          deleteItem
            ? [deleteItem.degree, deleteItem.fieldOfStudy].filter(Boolean).join(" in ")
            : undefined
        }
      />
    </div>
  );
}
