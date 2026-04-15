import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {}

/**
 * Animated placeholder block used while content is loading.
 *
 * Render a Skeleton at the approximate shape and size of the content
 * that will replace it. Compose multiple Skeletons to mirror more
 * complex layouts (cards, tables, text blocks).
 */
function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton };
export type { SkeletonProps };
