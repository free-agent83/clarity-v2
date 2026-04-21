"use client";

import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { Button } from "../../atoms/button/button";
import { Typography } from "../../atoms/typography/typography";

export interface AllFiltersButtonProps {
  activeFilterCount: number;
  onClick: () => void;
}

/**
 * "All filters" button — opens the filter drawer and shows an active
 * count badge when filters are engaged.
 *
 * Used inside the FilterToolbar's main chrome and its sticky chrome so
 * the button stays in sync across surfaces.
 */
export function AllFiltersButton({
  activeFilterCount,
  onClick,
}: AllFiltersButtonProps) {
  return (
    <Button variant="outline" onClick={onClick} className="shrink-0">
      <IconAdjustmentsHorizontal className="mr-1.5 h-4 w-4" />
      All filters
      {activeFilterCount > 0 && (
        <Typography asChild variant="caption">
          <span className="bg-accent text-accent-foreground px-1.5 rounded-full">
            {activeFilterCount}
          </span>
        </Typography>
      )}
    </Button>
  );
}
