import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <>
      <div className="mb-8">
        <Skeleton className="h-7 w-32 mb-1" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="mb-6">
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="space-y-8">
        {Array.from({ length: 6 }, (_, i) => `skel-${i}`).map((key) => (
          <div key={key} className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
            <Skeleton className="h-4 w-3/4 mb-3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </>
  );
}
