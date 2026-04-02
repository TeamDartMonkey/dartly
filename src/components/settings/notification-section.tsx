"use client";

type NotificationSectionProps = {
  preferences: {
    emailJobUpdates: boolean;
    emailDeadlineReminders: boolean;
    emailWeeklySummary: boolean;
  };
  onToggle: (key: keyof NotificationSectionProps["preferences"]) => void;
};

function Toggle({ checked, onChange, label, description }: {
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

export function NotificationSection({ preferences, onToggle }: NotificationSectionProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-zinc-50 mb-4">Notifications</h2>

      <div className="divide-y divide-zinc-800">
        <Toggle
          checked={preferences.emailJobUpdates}
          onChange={() => onToggle("emailJobUpdates")}
          label="Job status updates"
          description="Get notified when a job's stage changes."
        />
        <Toggle
          checked={preferences.emailDeadlineReminders}
          onChange={() => onToggle("emailDeadlineReminders")}
          label="Deadline reminders"
          description="Receive reminders before upcoming application deadlines."
        />
        <Toggle
          checked={preferences.emailWeeklySummary}
          onChange={() => onToggle("emailWeeklySummary")}
          label="Weekly summary"
          description="A weekly digest of your job search activity."
        />
      </div>
    </div>
  );
}
