"use client";

import { Select } from "@/components/ui/select";
import type { DashboardView, UserPreferences } from "@/types/settings";

type AppPreferencesSectionProps = {
  preferences: UserPreferences;
  onUpdate: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
};

const labelStyles = "mb-1 block text-xs font-medium text-zinc-400";

const JOB_STAGES = [
  { value: "INTERESTED", label: "Interested" },
  { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
] as const;

const DASHBOARD_VIEWS = [
  { value: "card", label: "Card" },
  { value: "list", label: "List" },
] as const;

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-zinc-300">{label}</p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent cursor-pointer transition-colors ${
          checked ? "bg-indigo-500" : "bg-zinc-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-zinc-50 shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

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
            onChange={(val) =>
              onUpdate("defaultJobStage", val as UserPreferences["defaultJobStage"])
            }
            options={[...JOB_STAGES]}
          />
        </div>

        <div>
          <label className={labelStyles} htmlFor="dashboardView">
            Dashboard view
          </label>
          <Select
            id="dashboardView"
            value={preferences.dashboardView}
            onChange={(val) => onUpdate("dashboardView", val as DashboardView)}
            options={[...DASHBOARD_VIEWS]}
          />
        </div>

        <Toggle
          checked={preferences.showArchived}
          onChange={() => onUpdate("showArchived", !preferences.showArchived)}
          label="Show archived jobs"
          description="Display archived jobs on the dashboard."
        />

        <Toggle
          checked={preferences.autoArchiveRejected}
          onChange={() => onUpdate("autoArchiveRejected", !preferences.autoArchiveRejected)}
          label="Auto-archive rejected jobs"
          description="Automatically archive jobs after they've been rejected."
        />

        {preferences.autoArchiveRejected && (
          <div>
            <label className={labelStyles} htmlFor="archiveDays">
              Days before auto-archiving
            </label>
            <input
              id="archiveDays"
              type="number"
              min={1}
              max={365}
              value={preferences.autoArchiveRejectedDays}
              onChange={(e) => {
                const val = Number.parseInt(e.target.value, 10);
                if (val >= 1 && val <= 365) {
                  onUpdate("autoArchiveRejectedDays", val);
                }
              }}
              className="w-24 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
}
