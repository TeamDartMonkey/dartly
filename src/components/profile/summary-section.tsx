"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileData } from "@/types/profile";

type SummarySectionProps = {
  profile: ProfileData;
  onUpdate: (fields: Partial<ProfileData>) => void;
};

export function SummarySection({ profile, onUpdate }: SummarySectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [summary, setSummary] = useState(profile.summary ?? "");

  function openModal() {
    setHeadline(profile.headline ?? "");
    setSummary(profile.summary ?? "");
    setModalOpen(true);
  }

  const isUnchanged =
    headline.trim() === (profile.headline ?? "") && summary.trim() === (profile.summary ?? "");

  function handleSave() {
    onUpdate({
      headline: headline.trim() || undefined,
      summary: summary.trim() || undefined,
    });
    setModalOpen(false);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-50">Professional Summary</h2>
        <button
          type="button"
          onClick={openModal}
          className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
        >
          Edit
        </button>
      </div>

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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Professional Summary">
        <div className="space-y-4">
          <Input
            id="summary-headline"
            label="Headline"
            placeholder="Full Stack Developer | React & Node.js"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
          <Textarea
            id="summary-text"
            label="Summary"
            placeholder="Brief overview of your professional background and goals..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={5}
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isUnchanged}
              className="bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
