"use client";

import { useState } from "react";
import type { ProfileData } from "@/types/profile";

type SummarySectionProps = {
  profile: ProfileData;
  onUpdate: (fields: Partial<ProfileData>) => void;
};

const inputStyles =
  "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

const labelStyles = "mb-1 block text-xs font-medium text-zinc-400";

export function SummarySection({ profile, onUpdate }: SummarySectionProps) {
  const [editing, setEditing] = useState(false);
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [summary, setSummary] = useState(profile.summary ?? "");

  function handleSave() {
    onUpdate({
      headline: headline.trim() || undefined,
      summary: summary.trim() || undefined,
    });
    setEditing(false);
  }

  function handleCancel() {
    setHeadline(profile.headline ?? "");
    setSummary(profile.summary ?? "");
    setEditing(false);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-50">Professional Summary</h2>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className={labelStyles} htmlFor="headline">Headline</label>
            <input
              id="headline"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className={inputStyles}
              placeholder="Full Stack Developer | React & Node.js"
            />
          </div>
          <div>
            <label className={labelStyles} htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className={`${inputStyles} min-h-[120px] resize-y`}
              placeholder="Brief overview of your professional background and goals..."
              rows={5}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-zinc-500">Headline</p>
            <p className="text-zinc-50">
              {profile.headline || <span className="text-zinc-600">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Summary</p>
            <p className="text-zinc-50 whitespace-pre-wrap">
              {profile.summary || <span className="text-zinc-600">Not set</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
