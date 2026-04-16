import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Responsive grid layout for PLP items.
 *
 * Renders 2 columns on mobile, 3 on tablet, 4 on desktop.
 * Column counts are system-controlled — not category-configurable.
 */
export function PlpGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6",
        className
      )}
      role="list"
      data-slot="plp-grid"
    >
      {children}
    </div>
  );
}
