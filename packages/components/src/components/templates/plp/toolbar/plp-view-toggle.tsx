"use client";

import { IconLayoutGrid, IconListDetails } from "@tabler/icons-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../atoms/toggle-group/toggle-group";
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
    <ToggleGroup
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
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <IconLayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <IconListDetails className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
