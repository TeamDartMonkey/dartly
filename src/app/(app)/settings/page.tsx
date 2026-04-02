"use client";

import { useState } from "react";
import { AccountSection } from "@/components/settings/account-section";
import { AppPreferencesSection } from "@/components/settings/app-preferences-section";
import { NotificationSection } from "@/components/settings/notification-section";

export default function SettingsPage() {
  const [email, setEmail] = useState("");

  const [notifications, setNotifications] = useState({
    emailJobUpdates: true,
    emailDeadlineReminders: true,
    emailWeeklySummary: false,
  });

  const [appPreferences, setAppPreferences] = useState({
    defaultJobStage: "Interested",
    showArchived: false,
  });

  function handleToggleNotification(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleUpdatePreference(key: string, value: string | boolean) {
    setAppPreferences((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-50">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your account, notifications, and preferences.
        </p>
      </div>

      <div className="space-y-8">
        <AccountSection email={email} onUpdateEmail={setEmail} onUpdatePassword={() => {}} />
        <NotificationSection preferences={notifications} onToggle={handleToggleNotification} />
        <AppPreferencesSection preferences={appPreferences} onUpdate={handleUpdatePreference} />
      </div>
    </>
  );
}
