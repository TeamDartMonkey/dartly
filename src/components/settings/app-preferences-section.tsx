"use client";

import { Select } from "@/components/ui/select";

type AppPreferencesSectionProps = {
  preferences: {
    defaultJobStage: string;
    showArchived: boolean;
  };
  onUpdate: (key: string, value: string | boolean) => void;
};

const labelStyles = "mb-1 block text-xs font-medium text-zinc-400";

const JOB_STAGES = ["Interested", "Applied", "Interview", "Offer"];

export function AppPreferencesSection({ preferences, onUpdate }: AppPreferencesSectionProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-zinc-50 mb-4">Application Preferences</h2>

      <div className="space-y-4">
        <div>
          <label className={labelStyles} htmlFor="defaultStage">
            Default stage for new jobs
          </label>
          <Select
            id="defaultStage"
            value={preferences.defaultJobStage}
            onChange={(val) => onUpdate("defaultJobStage", val)}
            options={JOB_STAGES.map((stage) => ({ value: stage, label: stage }))}
          />
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-zinc-300">Show archived jobs</p>
            <p className="text-xs text-zinc-500">Display archived jobs on the dashboard.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={preferences.showArchived}
            onClick={() => onUpdate("showArchived", !preferences.showArchived)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent cursor-pointer transition-colors ${
              preferences.showArchived ? "bg-indigo-500" : "bg-zinc-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-zinc-50 shadow-sm transition-transform ${
                preferences.showArchived ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
