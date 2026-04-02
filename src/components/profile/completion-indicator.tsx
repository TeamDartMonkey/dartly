import type { CompletionField } from "@/types/profile";
import { cn } from "@/utils/cn";

type CompletionIndicatorProps = {
  fields: CompletionField[];
};

export function CompletionIndicator({ fields }: CompletionIndicatorProps) {
  const completed = fields.filter((f) => f.complete).length;
  const total = fields.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-50">
          Profile Completion
        </h2>
        <span
          className={cn(
            "text-2xl font-semibold",
            percent === 100 ? "text-green-400" : percent >= 50 ? "text-yellow-400" : "text-red-400"
          )}
        >
          {percent}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            percent === 100
              ? "bg-green-400"
              : percent >= 50
                ? "bg-yellow-400"
                : "bg-red-400"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {fields.map((field) => (
          <div key={field.label} className="flex items-center gap-2 text-sm">
            {field.complete ? (
              <svg
                className="shrink-0 text-green-400"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg
                className="shrink-0 text-zinc-600"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
            )}
            <span className={field.complete ? "text-zinc-300" : "text-zinc-500"}>
              {field.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
