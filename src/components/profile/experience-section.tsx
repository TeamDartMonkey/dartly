"use client";

import { type DragEvent, useState } from "react";
import type { Experience } from "@/types/profile";

type ExperienceSectionProps = {
  experiences: Experience[];
  onUpdate: (experiences: Experience[], message?: string) => void;
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
  const [_modalOpen, setModalOpen] = useState(false);
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

  function _confirmDelete() {
    if (deleteIndex === null) return;

    onUpdate(
      experiences.filter((_, i) => i !== deleteIndex),
      "Experience removed"
    );

    setDeleteIndex(null);
  }

  function _handleSave(experience: Experience) {
    if (editingIndex !== null) {
      const updated = experiences.map((exp, i) => (i === editingIndex ? experience : exp));
      onUpdate(updated, "Experience updated");
    } else {
      onUpdate([...experiences, experience], "Experience added");
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

    const updated = [...experiences];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, movedItem);

    onUpdate(updated, "Experience reordered");
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  const _deleteItem = deleteIndex !== null ? experiences[deleteIndex] : null;

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-zinc-50">Experience</h2>

      {experiences.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-700 py-8">
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
        <div>
          <ul className="space-y-3">
            {experiences.map((exp, index) => {
              const isDragging = draggedIndex === index;
              const isDragTarget = dragOverIndex === index && draggedIndex !== index;

              return (
                <li
                  key={exp.id || index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={[
                    "group list-none rounded-lg border bg-zinc-950/40 p-4 transition-colors",
                    isDragging
                      ? "border-indigo-500 opacity-50"
                      : isDragTarget
                        ? "border-indigo-400"
                        : "border-zinc-700 hover:border-zinc-600",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(index)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="text-sm font-medium text-zinc-50">
                        {exp.title || <span className="text-zinc-600">Untitled</span>}
                        {exp.organization && (
                          <span className="font-normal text-zinc-400"> at {exp.organization}</span>
                        )}
                      </p>

                      <p className="mt-0.5 text-xs text-zinc-500">{formatDateRange(exp)}</p>

                      {exp.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{exp.description}</p>
                      )}
                    </button>

                    <div className="flex shrink-0 items-center gap-1">
                      <span
                        className="select-none px-2 py-1 text-zinc-500 cursor-grab active:cursor-grabbing"
                        title="Drag to reorder"
                        aria-hidden="true"
                      >
                        ⋮⋮
                      </span>

                      <button
                        type="button"
                        onClick={() => handleEdit(index)}
                        className="p-1.5 text-zinc-500 transition-colors hover:text-indigo-400"
                        aria-label="Edit"
                        title="Edit"
                      >
                        ✎
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(index)}
                        className="p-1.5 text-zinc-500 transition-colors hover:text-red-400"
                        aria-label="Delete"
                        title="Delete"
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
                          aria-hidden="true"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
