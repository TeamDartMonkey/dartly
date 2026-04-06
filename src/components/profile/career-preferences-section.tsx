"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";
import type { ProfileData } from "@/types/profile";

type CareerPreferencesSectionProps = {
  profile: ProfileData;
  onUpdate: (fields: Partial<ProfileData>) => void;
};

const inputStyles =
  "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

const labelStyles = "mb-1 block text-xs font-medium text-zinc-400";

const WORK_MODES = ["Remote", "Hybrid", "On-site", "Flexible"];

export function CareerPreferencesSection({ profile, onUpdate }: CareerPreferencesSectionProps) {
  const [editing, setEditing] = useState(false);
  const [targetRoles, setTargetRoles] = useState(profile.targetRoles.join(", "));
  const [targetLocations, setTargetLocations] = useState(profile.targetLocations.join(", "));
  const [workMode, setWorkMode] = useState(profile.workModePreference ?? "");
  const [salary, setSalary] = useState(profile.salaryPreference?.toString() ?? "");

  function handleSave() {
    onUpdate({
      targetRoles: targetRoles
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      targetLocations: targetLocations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      workModePreference: workMode || undefined,
      salaryPreference: salary ? Number.parseInt(salary, 10) : undefined,
    });
    setEditing(false);
  }

  function handleCancel() {
    setTargetRoles(profile.targetRoles.join(", "));
    setTargetLocations(profile.targetLocations.join(", "));
    setWorkMode(profile.workModePreference ?? "");
    setSalary(profile.salaryPreference?.toString() ?? "");
    setEditing(false);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-50">Career Preferences</h2>
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
            <label className={labelStyles} htmlFor="targetRoles">
              Target Roles (comma-separated)
            </label>
            <input
              id="targetRoles"
              type="text"
              value={targetRoles}
              onChange={(e) => setTargetRoles(e.target.value)}
              className={inputStyles}
              placeholder="Software Engineer, Frontend Developer"
            />
          </div>
          <div>
            <label className={labelStyles} htmlFor="targetLocations">
              Target Locations (comma-separated)
            </label>
            <input
              id="targetLocations"
              type="text"
              value={targetLocations}
              onChange={(e) => setTargetLocations(e.target.value)}
              className={inputStyles}
              placeholder="New York, San Francisco, Remote"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelStyles} htmlFor="workMode">
                Work Mode
              </label>
              <Select
                id="workMode"
                value={workMode}
                onChange={setWorkMode}
                placeholder="Select preference"
                options={WORK_MODES.map((mode) => ({ value: mode, label: mode }))}
              />
            </div>
            <div>
              <label className={labelStyles} htmlFor="salary">
                Salary Preference ($/year)
              </label>
              <input
                id="salary"
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className={inputStyles}
                placeholder="85000"
                min="0"
              />
            </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-zinc-500">Target Roles</p>
            <p className="text-zinc-50">
              {profile.targetRoles.length > 0 ? (
                profile.targetRoles.join(", ")
              ) : (
                <span className="text-zinc-600">Not set</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Target Locations</p>
            <p className="text-zinc-50">
              {profile.targetLocations.length > 0 ? (
                profile.targetLocations.join(", ")
              ) : (
                <span className="text-zinc-600">Not set</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Work Mode</p>
            <p className="text-zinc-50">
              {profile.workModePreference || <span className="text-zinc-600">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Salary Preference</p>
            <p className="text-zinc-50">
              {profile.salaryPreference ? (
                `$${profile.salaryPreference.toLocaleString()}/year`
              ) : (
                <span className="text-zinc-600">Not set</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
