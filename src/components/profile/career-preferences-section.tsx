"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import type { ProfileData } from "@/types/profile";

type CareerPreferencesSectionProps = {
  profile: ProfileData;
  onUpdate: (fields: Partial<ProfileData>) => void;
};

const WORK_MODES = [
  { value: "Remote", label: "Remote" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "On-site", label: "On-site" },
  { value: "Flexible", label: "Flexible" },
];

export function CareerPreferencesSection({ profile, onUpdate }: CareerPreferencesSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [targetRoles, setTargetRoles] = useState(profile.targetRoles.join(", "));
  const [targetLocations, setTargetLocations] = useState(profile.targetLocations.join(", "));
  const [workMode, setWorkMode] = useState(profile.workModePreference ?? "");
  const [salary, setSalary] = useState(profile.salaryPreference?.toString() ?? "");

  function openModal() {
    setTargetRoles(profile.targetRoles.join(", "));
    setTargetLocations(profile.targetLocations.join(", "));
    setWorkMode(profile.workModePreference ?? "");
    setSalary(profile.salaryPreference?.toString() ?? "");
    setModalOpen(true);
  }

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
      salaryPreference: (() => {
        if (!salary) return undefined;
        // Use Number + isInteger to reject "1e9", "45.5", "45k" etc rather
        // than silently coercing to an unexpected integer.
        const n = Number(salary);
        return Number.isInteger(n) && n >= 0 ? n : undefined;
      })(),
    });
    setModalOpen(false);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-50">Career Preferences</h2>
        <button
          type="button"
          onClick={openModal}
          className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
        >
          Edit
        </button>
      </div>

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
              `$${profile.salaryPreference.toLocaleString()}/hr`
            ) : (
              <span className="text-zinc-600">Not set</span>
            )}
          </p>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Career Preferences">
        <div className="space-y-4">
          <Input
            id="career-targetRoles"
            label="Target Roles (comma-separated)"
            placeholder="Software Engineer, Frontend Developer"
            value={targetRoles}
            onChange={(e) => setTargetRoles(e.target.value)}
          />
          <Input
            id="career-targetLocations"
            label="Target Locations (comma-separated)"
            placeholder="New York, San Francisco, Remote"
            value={targetLocations}
            onChange={(e) => setTargetLocations(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="career-workMode"
                className="mb-1 block text-xs font-medium text-zinc-400"
              >
                Work Mode
              </label>
              <Select
                id="career-workMode"
                value={workMode}
                onChange={setWorkMode}
                placeholder="Select preference"
                options={WORK_MODES}
              />
            </div>
            <Input
              id="career-salary"
              label="Salary Preference ($/hr)"
              type="number"
              placeholder="45"
              min="0"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>
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
              className="bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
