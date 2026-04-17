"use client";

import { IconLayoutGrid, IconListDetails } from "@tabler/icons-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../atoms/toggle-group/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../atoms/tooltip/tooltip";
import type { PlpViewMode } from "../plp-types";

/**
 * Grid/list view toggle.
 *
 * Renders two mutually exclusive toggle buttons — one for grid, one for
 * list. Announces as a radio group to screen readers via ToggleGroup's
 * underlying semantics (type="single").
 */
export function PlpViewToggle({
  value,
  onValueChange,
}: {
  value: PlpViewMode;
  onValueChange: (value: PlpViewMode) => void;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <ToggleGroup
        variant="outline"
        type="single"
        value={value}
        onValueChange={(next) => {
          if (next === "grid" || next === "list") {
            onValueChange(next);
          }
        }}
        aria-label="View mode"
        className="shrink-0"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="grid"
              aria-label="Grid view"
              className="aria-checked:bg-accent aria-checked:text-accent-foreground"
            >
              <IconLayoutGrid />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom">Grid view</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="list"
              aria-label="List view"
              className="aria-checked:bg-accent aria-checked:text-accent-foreground"
            >
              <IconListDetails />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom">List view</TooltipContent>
        </Tooltip>
      </ToggleGroup>
    </TooltipProvider>
  );
}
