"use client";

import { useState } from "react";

type AccountSectionProps = {
  email: string;
  onUpdateEmail: (email: string) => void;
  onUpdatePassword: (current: string, newPassword: string) => void;
};

const inputStyles =
  "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

const labelStyles = "mb-1 block text-xs font-medium text-zinc-400";

export function AccountSection({ email, onUpdateEmail, onUpdatePassword }: AccountSectionProps) {
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState(email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function handleSaveEmail() {
    if (newEmail.trim()) {
      onUpdateEmail(newEmail.trim());
    }
    setEditingEmail(false);
  }

  function handleCancelEmail() {
    setNewEmail(email);
    setEditingEmail(false);
  }

  function handleSavePassword() {
    setPasswordError("");
    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    onUpdatePassword(currentPassword, newPassword);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setEditingPassword(false);
  }

  function handleCancelPassword() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setEditingPassword(false);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-zinc-50 mb-6">Account</h2>

      {/* Email */}
      <div className="mb-6 pb-6 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-zinc-300">Email Address</p>
          {!editingEmail && (
            <button
              type="button"
              onClick={() => setEditingEmail(true)}
              className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-3 py-1.5 rounded-md text-xs font-medium"
            >
              Change
            </button>
          )}
        </div>

        {editingEmail ? (
          <div className="space-y-3">
            <div>
              <label className={labelStyles} htmlFor="newEmail">New Email</label>
              <input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={inputStyles}
                placeholder="new@example.com"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEmail}
                className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEmail}
                className="bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-50">{email || <span className="text-zinc-600">Not set</span>}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-zinc-300">Password</p>
          {!editingPassword && (
            <button
              type="button"
              onClick={() => setEditingPassword(true)}
              className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-3 py-1.5 rounded-md text-xs font-medium"
            >
              Change
            </button>
          )}
        </div>

        {editingPassword ? (
          <div className="space-y-3">
            {passwordError && (
              <p className="text-sm text-red-400">{passwordError}</p>
            )}
            <div>
              <label className={labelStyles} htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputStyles}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className={labelStyles} htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputStyles}
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className={labelStyles} htmlFor="confirmNewPassword">Confirm New Password</label>
              <input
                id="confirmNewPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputStyles}
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelPassword}
                className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePassword}
                className="bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
              >
                Update Password
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">••••••••</p>
        )}
      </div>
    </div>
  );
}
