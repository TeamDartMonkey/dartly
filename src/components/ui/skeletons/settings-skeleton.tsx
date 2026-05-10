import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <>
      <div className="mb-8">
        <Skeleton className="h-7 w-32 mb-1" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
          <Skeleton className="h-6 w-24 mb-6" />
          <div className="mb-6 pb-6 border-b border-zinc-800">
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
          <Skeleton className="h-6 w-52 mb-4" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-3 w-36 mb-1" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div>
              <Skeleton className="h-3 w-28 mb-1" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-zinc-800">
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>
    </>
  );
}
