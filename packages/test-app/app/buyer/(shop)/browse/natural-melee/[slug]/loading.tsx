import { Skeleton } from "@/components/ui/skeleton";

export default function NaturalMeleeDetailLoading() {
  return (
    <div className="flex flex-col gap-12 pb-32">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="size-4 rounded-full" />
        <Skeleton className="h-5 w-56" />
      </div>

      <div className="grid grid-cols-[1fr_480px] items-start gap-12">
        <div className="sticky top-5 flex gap-4">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <Skeleton className="h-16 w-16 rounded-xl" />
            <Skeleton className="h-16 w-16 rounded-xl" />
          </div>
          <Skeleton className="aspect-square min-w-0 flex-1 rounded-xl" />
        </div>

        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10.5 w-full" />
            <div>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="mt-1 h-8 w-32" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-11.25 flex-1 rounded-lg" />
              <Skeleton className="h-11.25 flex-1 rounded-lg" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-32" />
            <div className="flex flex-col overflow-hidden rounded-lg border border-border">
              <div className="flex items-center justify-between px-4 py-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="size-5" />
              </div>
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-t border-border px-4 py-3"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Skeleton className="h-15 w-full rounded-lg" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-6 w-56" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-32" />
            <div className="flex flex-col">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={
                    i < 7
                      ? "flex items-center gap-5 border-b border-border py-4"
                      : "flex items-center gap-5 py-4"
                  }
                >
                  <Skeleton className="h-5 w-45" />
                  <Skeleton className="ml-auto h-5 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <hr className="border-border" />

      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
