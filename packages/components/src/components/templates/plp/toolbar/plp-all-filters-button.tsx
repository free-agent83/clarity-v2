"use client";

import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { Badge } from "../../../atoms/badge/badge";
import { Button } from "../../../atoms/button/button";

/**
 * "All Filters" button — opens the filter drawer and shows an active
 * count badge when filters are engaged.
 *
 * Shared between the main toolbar and the sticky filter bar so the
 * button stays in sync visually and semantically across both surfaces.
 */
export function PlpAllFiltersButton({
  activeFilterCount,
  onClick,
}: {
  activeFilterCount: number;
  onClick: () => void;
}) {
  return (
    <Button variant="outline" onClick={onClick} className="shrink-0">
      <IconAdjustmentsHorizontal className="mr-1.5 h-4 w-4" />
      All filters
      {activeFilterCount > 0 && (
        <Badge size="sm" className="ml-1.5">
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );
}
