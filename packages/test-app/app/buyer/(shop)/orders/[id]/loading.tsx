import { Skeleton } from "@nivoda/components";

export default function OrderDetailLoading() {
  return (
    <div className="flex flex-col gap-14 pb-44 pt-12">
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="flex flex-col gap-9">
          {/* Back link */}
          <Skeleton className="h-5 w-36" />

          {/* Title */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-7 w-48" />
          </div>

          {/* Progress tracker */}
          <div className="flex gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-1 flex-col gap-3">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>

          {/* Status message */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-72" />
            <Skeleton className="h-5 w-56" />
          </div>
        </div>
      </div>

      <Skeleton className="mx-auto h-px w-full max-w-5xl" />

      <div className="mx-auto flex w-full max-w-5xl gap-9 px-6">
        <div className="flex flex-1 flex-col gap-10">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
        <Skeleton className="h-96 w-96 shrink-0 rounded-xl" />
      </div>
    </div>
  );
}
