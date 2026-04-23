import { Skeleton } from "@/components/ui/skeleton";

export default function LabGrownDiamondsListLoading() {
  return (
    <div className="flex flex-col gap-12 pb-32">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-40" />
      </div>

      <div className="flex flex-col gap-8">
        <Skeleton className="h-14 w-80" />

        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-11.25 w-20 rounded-md" />
            <Skeleton className="h-11.25 w-20 rounded-md" />
            <Skeleton className="h-11.25 w-20 rounded-md" />
            <Skeleton className="h-11.25 w-24 rounded-md" />
            <Skeleton className="h-11.25 w-16 rounded-md" />
            <Skeleton className="h-11.25 w-28 rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-x-5 gap-y-16">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <div className="flex flex-col gap-2">
                <div>
                  <Skeleton className="h-7 w-full" />
                  <Skeleton className="mt-1 h-5 w-2/3" />
                </div>
                <div>
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="mt-1 h-7 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
