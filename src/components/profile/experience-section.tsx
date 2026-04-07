"use client";

import { useState } from "react";
import { ExperienceForm } from "@/components/profile/experience-form";
import { Modal } from "@/components/ui/modal";
import type { Experience } from "@/types/profile";

type ExperienceSectionProps = {
  experiences: Experience[];
  onUpdate: (experiences: Experience[]) => void;
};

function formatDate(date: string | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatDateRange(exp: Experience): string {
  const start = formatDate(exp.startDate);
  if (!start) return "";
  if (exp.isCurrent) return `${start} - Present`;
  const end = formatDate(exp.endDate);
  return end ? `${start} - ${end}` : start;
}

export function ExperienceSection({ experiences, onUpdate }: ExperienceSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  function handleAdd() {
    setEditingIndex(null);
    setModalOpen(true);
  }

  function handleEdit(index: number) {
    setEditingIndex(index);
    setModalOpen(true);
  }

  function handleDelete(index: number) {
    const exp = experiences[index];
    const label = exp?.title?.trim() || "this experience";
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    onUpdate(experiences.filter((_, i) => i !== index));
  }

  function handleSave(experience: Experience) {
    if (editingIndex !== null) {
      const updated = experiences.map((exp, i) => (i === editingIndex ? experience : exp));
      onUpdate(updated);
    } else {
      onUpdate([...experiences, { ...experience, id: crypto.randomUUID() }]);
    }
    setModalOpen(false);
    setEditingIndex(null);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-50">Experience</h2>
        <button
          type="button"
          onClick={handleAdd}
          className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
        >
          Add
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="border border-dashed border-zinc-700 rounded-lg py-8 flex flex-col items-center gap-2">
          <p className="text-sm text-zinc-500">No experience added yet</p>
          <button
            type="button"
            onClick={handleAdd}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            + Add your first experience
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp, index) => (
            // biome-ignore lint/a11y/useSemanticElements: div needed to nest child buttons
            <div
              key={exp.id || index}
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
                    {exp.title || <span className="text-zinc-600">Untitled</span>}
                    {exp.organization && (
                      <span className="text-zinc-400 font-normal"> at {exp.organization}</span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{formatDateRange(exp)}</p>
                  {exp.description && (
                    <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{exp.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(index);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors"
                    aria-label="Edit"
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
                      aria-label="Edit"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
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
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingIndex !== null ? "Edit Experience" : "Add Experience"}
      >
        <ExperienceForm
          key={editingIndex ?? "new"}
          experience={editingIndex !== null ? experiences[editingIndex] : undefined}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
