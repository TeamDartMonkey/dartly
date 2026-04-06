import { Skeleton } from "@/components/ui/skeleton";

function SectionSkeleton({ lines = 3 }: { lines?: number }) {
  const items = Array.from({ length: lines }, (_, i) => `line-${i}`);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <Skeleton className="h-5 w-40 mb-5" />
      <div className="space-y-4">
        {items.map((key) => (
          <div key={key}>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

const COMPLETION_ITEMS = Array.from({ length: 8 }, (_, i) => `check-${i}`);

export function ProfileSkeleton() {
  return (
    <>
      <div className="mb-8">
        <Skeleton className="h-7 w-24 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-7 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {COMPLETION_ITEMS.map((key) => (
            <Skeleton key={key} className="h-4 w-32" />
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <SectionSkeleton lines={4} />
        <SectionSkeleton lines={2} />
        <SectionSkeleton lines={4} />
        <SectionSkeleton lines={2} />
      </div>
    </>
  );
}
