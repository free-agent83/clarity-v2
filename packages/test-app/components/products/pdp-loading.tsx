import {
  PlpGridContainer,
  Separator,
  Skeleton,
} from "@nivoda/components";

// Loading skeleton that mirrors the shape of the PDP pages. Keep in
// sync with the stone + engagement-ring [slug] page compositions.
export function PdpLoading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 pb-32">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="size-4 rounded-full" />
        <Skeleton className="h-5 w-56" />
      </div>

      {/* PdpLayout two-column */}
      <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:items-start md:gap-12">
        {/* Media column */}
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="size-16 rounded-md" />
            <Skeleton className="size-16 rounded-md" />
            <Skeleton className="size-16 rounded-md" />
          </div>
        </div>

        {/* Body column */}
        <div className="flex flex-col gap-6">
          {/* PdpHeading */}
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-3/4" />
          </div>

          {/* PdpPrice */}
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-32" />
          </div>

          {/* Returns + delivery */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-5 w-56" />
          </div>

          {/* Primary action */}
          <div className="flex flex-col gap-3">
            <Skeleton className="h-11 w-full rounded-lg" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 flex-1 rounded-lg" />
              <Skeleton className="h-9 flex-1 rounded-lg" />
            </div>
          </div>

          <Separator />

          {/* Specifications */}
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-40" />
            <div className="flex flex-col divide-y divide-border">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Related items */}
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <PlpGridContainer loading skeletonCount={4} />
      </div>
    </div>
  );
}
