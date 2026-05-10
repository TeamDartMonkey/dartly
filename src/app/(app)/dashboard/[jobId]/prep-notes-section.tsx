"use client";

import { useMemo, useState } from "react";
import { showToast } from "@/components/ui/toast";
import type { Job } from "@/types/job";

interface Props {
  job: Job;
  onJobUpdated: (job: Job) => void;
}

// Three discrete sections so candidates have a real structure to fill in
// rather than staring at a single freeform textarea. Each persists to its own
// column on Job and saves together in one PUT.
type SectionKey = "star" | "questions" | "talkingPoints";

interface SectionDef {
  key: SectionKey;
  label: string;
  description: string;
  placeholder: string;
  rows: number;
}

const SECTIONS: SectionDef[] = [
  {
    key: "star",
    label: "STAR Stories",
    description: "Situation, Task, Action, Result. One per bullet — strong, specific, recent.",
    placeholder: `• Led migration of legacy auth to OAuth 2.0\n  S: Auth code was 6 years old, blocking SSO\n  T: Migrate without downtime in 2 weeks\n  A: Built shadow-mode rollout, A/B'd traffic\n  R: Zero downtime, 30% faster login latency\n\n• ...`,
    rows: 10,
  },
  {
    key: "questions",
    label: "Questions to Ask",
    description: "Thoughtful questions that show you've done research — for the interviewer or hiring manager.",
    placeholder: `• How does the team measure success in the first 90 days?\n• What's the most challenging engineering problem the team is currently solving?\n• How does this team work with [specific other team you read about]?`,
    rows: 7,
  },
  {
    key: "talkingPoints",
    label: "Talking Points",
    description: "Specifics about your experience, skills, and motivation you want to weave in.",
    placeholder: `• Why this company — connect to their mission\n• Strongest relevant experience for this role\n• Salary band & flexibility\n• Anything to clarify from the JD`,
    rows: 8,
  },
];

const FIELD_FROM_KEY: Record<SectionKey, "prepNotesStar" | "prepNotesQuestions" | "prepNotesTalkingPoints"> = {
  star: "prepNotesStar",
  questions: "prepNotesQuestions",
  talkingPoints: "prepNotesTalkingPoints",
};

export function PrepNotesSection({ job, onJobUpdated }: Props) {
  const initial = useMemo(
    () => ({
      star: job.prepNotesStar ?? "",
      questions: job.prepNotesQuestions ?? "",
      talkingPoints: job.prepNotesTalkingPoints ?? "",
    }),
    [job.prepNotesStar, job.prepNotesQuestions, job.prepNotesTalkingPoints]
  );

  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);

  // Compare against the snapshot taken when the job last loaded so saves are
  // accurate even after concurrent edits via other tabs.
  const isDirty =
    values.star !== initial.star ||
    values.questions !== initial.questions ||
    values.talkingPoints !== initial.talkingPoints;

  function handleChange(key: SectionKey, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (saving || !isDirty) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prepNotesStar: values.star.trim() || null,
          prepNotesQuestions: values.questions.trim() || null,
          prepNotesTalkingPoints: values.talkingPoints.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      const updated: Job = await res.json();
      onJobUpdated(updated);
      showToast("Prep notes saved");
    } catch {
      showToast("Failed to save prep notes", "error");
    } finally {
      setSaving(false);
    }
  }

  const totalChars =
    values.star.length + values.questions.length + values.talkingPoints.length;

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-medium text-zinc-50">Interview Prep Notes</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Structured prep for <span className="text-zinc-300">{job.company}</span>. Each
            section saves together — these notes are private to this job.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isDirty && <span className="text-xs text-amber-400">Unsaved changes</span>}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => {
          const value = values[section.key];
          const fieldId = `prep-${section.key}`;
          return (
            <div key={section.key}>
              <div className="flex items-baseline justify-between mb-1.5">
                <label htmlFor={fieldId} className="text-sm font-medium text-zinc-200">
                  {section.label}
                </label>
                {value.length > 0 && (
                  <span className="text-xs text-zinc-600">{value.length} chars</span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mb-2">{section.description}</p>
              <textarea
                id={fieldId}
                name={FIELD_FROM_KEY[section.key]}
                value={value}
                onChange={(e) => handleChange(section.key, e.target.value)}
                placeholder={section.placeholder}
                rows={section.rows}
                maxLength={20_000}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y leading-relaxed"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-zinc-600">
          Tip: Use the Research tab to generate company background, then use it here to seed
          your STAR stories and talking points.
        </p>
        {totalChars > 0 && (
          <p className="text-xs text-zinc-600 shrink-0 ml-4">{totalChars} total chars</p>
        )}
      </div>
    </div>
  );
}
