import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-36 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      <Skeleton className="mb-4 h-4 w-28" />

      <div className="grid gap-4">
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            <div className="mt-4 space-y-1">
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
