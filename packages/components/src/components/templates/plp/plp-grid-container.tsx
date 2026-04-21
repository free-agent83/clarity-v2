import type { ReactNode } from "react";
import { Skeleton } from "../../atoms/skeleton/skeleton";

export interface PlpGridContainerProps {
  children?: ReactNode;
  /** When true, replaces children with `skeletonCount` skeleton cards. */
  loading?: boolean;
  /** Number of skeleton cards to render when loading. Defaults to 20. */
  skeletonCount?: number;
}

/**
 * Responsive 2/3/4-column grid wrapper for PLP cards.
 *
 * When `loading` is true, renders a grid of skeleton cards tuned to
 * the default `PlpGridItem` card proportions (aspect-square image
 * placeholder, name + caption lines, badges, delivery / returns /
 * price lines). When false, renders `children`.
 */
export function PlpGridContainer({
  children,
  loading = false,
  skeletonCount = 20,
}: PlpGridContainerProps) {
  if (loading) {
    return (
      <div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
        data-slot="plp-grid"
        data-loading
      >
        {Array.from({ length: skeletonCount }, (_, i) => (
          <GridSkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
      data-slot="plp-grid"
    >
      {children}
    </div>
  );
}

function GridSkeletonCard() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-1">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  );
}
