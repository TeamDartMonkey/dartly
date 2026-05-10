import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder that mirrors the job card grid shown after data loads. */
export function DashboardSkeleton() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label="Loading jobs"
    >
      {[0, 1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
          {/* Title + stage badge row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-6 w-20 shrink-0 rounded-md" />
          </div>
          {/* Meta row (location / deadline) */}
          <div className="mt-4 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          {/* Action icons row */}
          <div className="mt-4 flex items-center justify-end gap-2">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
