import { Skeleton } from "../../../atoms/skeleton/skeleton";

/**
 * Skeleton loading state for the PLP grid.
 *
 * Renders a page-sized set of skeleton cards mirroring the grid item
 * structure: thumbnail placeholder, name lines, badge placeholders,
 * delivery line, price line.
 *
 * @param count Number of skeleton items to render. Defaults to 20.
 */
export function PlpGridSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
      role="list"
      data-slot="plp-grid"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col" role="listitem">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-1 h-3 w-1/2" />
          <div className="mt-1.5 flex gap-1">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-3 w-2/3" />
          <Skeleton className="mt-1 h-3 w-1/2" />
          <Skeleton className="mt-1 h-3 w-1/3" />
          <Skeleton className="mt-2 h-5 w-1/3" />
          <Skeleton className="mt-1 h-3 w-1/4" />
        </div>
      ))}
    </div>
  );
}
