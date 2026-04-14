"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/components/ui/toast";

const inputStyles =
  "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

const labelStyles = "mb-1 block text-xs font-medium text-zinc-400";

export function AccountSection() {
  const [email, setEmail] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.email) setEmail(data.email);
      })
      .catch(() => {});
  }, []);

  async function handleSaveEmail() {
    if (!newEmail.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim() }),
      });
      if (res.ok) {
        showToast("Confirmation email sent to new address");
        setEditingEmail(false);
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to change email", "error");
      }
    } catch {
      showToast("Failed to change email", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        showToast("Password reset email sent");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to send reset email", "error");
      }
    } catch {
      showToast("Failed to send reset email", "error");
    }
  }

  function handleCancelEmail() {
    setNewEmail("");
    setEditingEmail(false);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-zinc-50 mb-6">Account</h2>

      <div className="mb-6 pb-6 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-zinc-300">Email Address</p>
          {!editingEmail && (
            <button
              type="button"
              onClick={() => {
                setNewEmail(email);
                setEditingEmail(true);
              }}
              className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-3 py-1.5 rounded-md text-xs font-medium"
            >
              Change
            </button>
          )}
        </div>

        {editingEmail ? (
          <div className="space-y-3">
            <div>
              <label className={labelStyles} htmlFor="newEmail">
                New Email
              </label>
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
                disabled={saving}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-50">
            {email || <span className="text-zinc-600">Not set</span>}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-300">Password</p>
          <p className="mt-1 text-xs text-zinc-500">Send a password reset link to your email.</p>
        </div>
        <button
          type="button"
          onClick={handleResetPassword}
          className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-3 py-1.5 rounded-md text-xs font-medium"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}
