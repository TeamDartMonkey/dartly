"use client";

import { useCallback, useEffect, useState } from "react";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { AccountSection } from "@/components/settings/account-section";
import { AppPreferencesSection } from "@/components/settings/app-preferences-section";
import { showToast } from "@/components/ui/toast";
import type { UserPreferences } from "@/types/settings";
import { DEFAULT_PREFERENCES } from "@/types/settings";

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: UserPreferences) => setPreferences(data))
      .catch(() => showToast("Failed to load settings", "error"))
      .finally(() => setLoading(false));
  }, []);

  const updatePreference = useCallback(
    async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (res.ok) {
        const updated: UserPreferences = await res.json();
        setPreferences(updated);
      } else {
        showToast("Failed to save setting", "error");
      }
    },
    []
  );

  if (loading) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-50">Settings</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your account, notifications, and preferences.
          </p>
        </div>
        <div className="text-sm text-zinc-500">Loading...</div>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-50">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage your account and preferences.</p>
      </div>

      <div className="space-y-8">
        <AccountSection />
        {/* TODO: Future feature — email notification pipeline
            <NotificationSection preferences={notifications} onToggle={handleToggleNotification} />
        */}
        <AppPreferencesSection preferences={preferences} onUpdate={updatePreference} />
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-800">
        <LogoutButton />
      </div>
    </>
  );
}
