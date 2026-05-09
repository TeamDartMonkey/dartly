"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { AccountSection } from "@/components/settings/account-section";
import { AppPreferencesSection } from "@/components/settings/app-preferences-section";
import { SettingsSkeleton } from "@/components/ui/skeletons/settings-skeleton";
import { showToast } from "@/components/ui/toast";
import type { UserPreferences } from "@/types/settings";
import { DEFAULT_PREFERENCES } from "@/types/settings";

export default function SettingsPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/settings", { signal: ctrl.signal })
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: UserPreferences | null) => {
        if (ctrl.signal.aborted || !data) return;
        setPreferences(data);
      })
      .catch((err) => {
        if (ctrl.signal.aborted || err?.name === "AbortError") return;
        showToast("Failed to load settings", "error");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [router]);

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
    return <SettingsSkeleton />;
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
