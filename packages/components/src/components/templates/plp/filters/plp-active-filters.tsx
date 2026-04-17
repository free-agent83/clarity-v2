"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { IconX } from "@tabler/icons-react";
import { Button } from "../../../atoms/button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../atoms/popover/popover";
import { resolveFilterControl, formatFilterChipValue } from "./plp-filter-registry";
import type { FilterDefinition, FilterState, FilterValue } from "../plp-types";

/**
 * Active filter chips strip.
 *
 * Appears below the toolbar when any filter has a value. Each chip shows
 * the filter label and formatted value. Chips are interactive:
 * - Click opens a popover with the same registry-resolved control for editing.
 * - Dismiss button clears the filter.
 *
 * Becomes sticky at the top of the viewport when the toolbar scrolls
 * out of view.
 */
export function PlpActiveFilters({
  filters,
  filterState,
  onFilterChange,
  onClearAll,
}: {
  filters: FilterDefinition[];
  filterState: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
  onClearAll: () => void;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  // Intersection observer for sticky behaviour
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;

    const sentinel = document.createElement("div");
    sentinel.style.height = "1px";
    sentinel.style.marginTop = "-1px";
    el.parentElement?.insertBefore(sentinel, el);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  const activeFilters = filters.filter(
    (f) => filterState[f.id] !== undefined
  );

  if (activeFilters.length === 0) return null;

  return (
    <div
      ref={stripRef}
      className={cn(
        "flex items-center gap-2 overflow-x-auto py-2",
        isSticky &&
          "sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
      data-slot="plp-active-filters"
    >
      {activeFilters.map((definition) => {
        const chipText = formatFilterChipValue(
          definition,
          filterState[definition.id]
        );

        return (
          <ActiveFilterChip
            key={definition.id}
            definition={definition}
            filterState={filterState}
            chipText={chipText}
            onFilterChange={onFilterChange}
          />
        );
      })}

      <Button
        variant="ghost"
        className="shrink-0 text-muted-foreground"
        onClick={onClearAll}
      >
        Clear all
      </Button>
    </div>
  );
}

/**
 * Individual active filter chip with edit popover and dismiss button.
 */
function ActiveFilterChip({
  definition,
  filterState,
  chipText,
  onFilterChange,
}: {
  definition: FilterDefinition;
  filterState: FilterState;
  chipText: string;
  onFilterChange: (filterId: string, value: FilterValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState<FilterValue>(
    filterState[definition.id]
  );

  const FilterControl = resolveFilterControl(definition);

  function handleOpen(nextOpen: boolean) {
    if (nextOpen) {
      setLocalValue(filterState[definition.id]);
    }
    setOpen(nextOpen);
  }

  function handleApply() {
    onFilterChange(definition.id, localValue);
    setOpen(false);
  }

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    onFilterChange(definition.id, undefined);
  }

  const controlOptions =
    definition.preset === "boolean-chip"
      ? [{ value: "true", label: (definition as any).chipLabel || definition.label }]
      : "options" in definition
        ? definition.options
        : undefined;

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground cursor-pointer hover:bg-accent transition-colors"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Delete" || e.key === "Backspace") {
              onFilterChange(definition.id, undefined);
            }
          }}
        >
          <span>
            {definition.label}: {chipText}
          </span>
          <button
            type="button"
            className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
            aria-label={`Remove filter: ${definition.label}`}
            onClick={handleDismiss}
          >
            <IconX className="h-3 w-3" />
          </button>
        </span>
      </PopoverTrigger>
      <PopoverContent className="p-4" aria-label={`Edit filter: ${definition.label}`}>
        <div className="space-y-4">
          <FilterControl
            value={localValue}
            onChange={setLocalValue}
            options={controlOptions}
            definition={definition}
          />
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                onFilterChange(definition.id, undefined);
                setOpen(false);
              }}
            >
              Clear
            </Button>
            <Button onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
