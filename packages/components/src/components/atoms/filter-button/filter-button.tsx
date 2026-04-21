"use client";

import * as React from "react";
import { useState } from "react";
import { cva } from "class-variance-authority";
import { IconChevronDown, IconX } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover/popover";

/**
 * FilterButton variants.
 *
 * Active axis = whether the filter has a value applied. In the active state
 *   the button shows `label: chipSummary` and an inline dismiss X; in the
 *   inactive state the button shows just `label`.
 *
 * Only one visual variant is supported (outline, styled to match Button's
 * outline variant). Active state uses the same border and a filled tint
 * to indicate engagement — no separate "primary" or "filled" variant.
 */
const filterButtonVariants = cva(
  [
    // Layout
    "group/filter-button inline-flex h-11 shrink-0 items-stretch rounded-md border text-sm font-medium whitespace-nowrap transition-[color,background]",
    // Disabled
    "has-disabled:pointer-events-none has-disabled:opacity-50",
  ],
  {
    variants: {
      active: {
        true: "border-border bg-accent text-accent-foreground dark:border-input",
        false:
          "border-border bg-background hover:bg-muted hover:text-primary-hover dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

interface FilterButtonProps<V> {
  /** Filter label, always shown (e.g. "Color"). */
  label: string;
  /**
   * Formatted display of the current filter value (e.g. "Blue, Green +3").
   * Shown in the active-state chip as `label: chipSummary`. Omit when
   * the filter is inactive.
   */
  chipSummary?: string;
  /**
   * Whether the filter currently has an applied value. When `true`, renders
   * the active-state split button showing `label: chipSummary` with an
   * inline dismiss X. When `false`, renders the inactive single-button.
   */
  isActive: boolean;
  /**
   * Seeds the internal draft each time the popover opens. Typically the
   * consumer's currently-applied value for this filter so that opening the
   * popover starts from the committed state rather than a blank slate.
   */
  initialValue: V | undefined;
  /** Optional fixed width for the popover (CSS value or pixel number). */
  popoverWidth?: number | string;
  /**
   * Called with the current draft value when the user clicks Apply inside
   * the popover. The popover closes automatically after this fires.
   */
  onApply: (value: V | undefined) => void;
  /**
   * Called when the user clicks Clear inside the popover. The popover
   * closes automatically after this fires. Internally also resets the
   * draft to `undefined`.
   */
  onClear: () => void;
  /**
   * Called when the user clicks the dismiss X on an active filter chip.
   * Only rendered when `isActive` is `true`; no popover interaction.
   */
  onDismiss?: () => void;
  /**
   * Render prop for the filter control rendered inside the popover body,
   * above Apply / Clear. Receives the current draft value and a setter so
   * the consumer writes a controlled filter component against `draft` /
   * `setDraft` without owning the draft lifecycle.
   */
  children: (draft: V | undefined, setDraft: (v: V | undefined) => void) => React.ReactNode;
  /** Extra classes on the outer control element. */
  className?: string;
}

/**
 * FilterButton — a generic two-state control for applied filters with
 * internal per-popover draft state.
 *
 * **Inactive state** (`isActive: false`): renders a single outline button
 * showing the filter label with a trailing chevron-down icon indicating
 * that the button opens a popover. Clicking opens the popover.
 *
 * **Active state** (`isActive: true`): renders a split control with a
 * main clickable area showing `label: chipSummary` (opens the popover
 * for editing) and an inline dismiss X (calls `onDismiss`). The two
 * regions share a single rounded outline and a unified focus ring so the
 * control reads as one unit while exposing two distinct keyboard / click
 * targets.
 *
 * The popover always includes Apply / Clear actions below the render-prop
 * `children`. Both close the popover automatically. Draft state is owned
 * internally — seeded from `initialValue` each time the popover opens,
 * committed via `onApply(draft)` on Apply, and reset to `undefined` on
 * Clear. Consumers only write a controlled filter component against the
 * `draft` / `setDraft` args supplied by the render prop.
 *
 * Styling is modelled on Button's `outline` variant; the active state
 * uses a filled `bg-accent` tint to indicate engagement.
 *
 * @see {@link filterButtonVariants} for the full variant matrix.
 */
function FilterButton<V>({
  label,
  chipSummary,
  isActive,
  initialValue,
  popoverWidth,
  onApply,
  onClear,
  onDismiss,
  children,
  className,
}: FilterButtonProps<V>) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<V | undefined>(initialValue);

  function handleOpenChange(next: boolean) {
    if (next) {
      setDraft(initialValue);
    }
    setOpen(next);
  }

  function handleApply() {
    onApply(draft);
    setOpen(false);
  }

  function handleClear() {
    setDraft(undefined);
    onClear();
    setOpen(false);
  }

  const popoverStyle: React.CSSProperties | undefined = popoverWidth
    ? {
        width:
          typeof popoverWidth === "number"
            ? `${popoverWidth}px`
            : popoverWidth,
      }
    : undefined;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      {isActive ? (
        <div
          data-slot="filter-button"
          data-state="active"
          className={cn(
            filterButtonVariants({ active: true }),
            className
          )}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="relative flex items-center gap-1.5 rounded-l-[calc(var(--radius-md)-1px)] px-3 outline-none transition-colors hover:bg-accent/40 focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="text-muted-foreground">{label}:</span>
              <span>{chipSummary}</span>
            </button>
          </PopoverTrigger>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss?.();
            }}
            aria-label={`Remove filter: ${label}`}
            className="relative flex items-center rounded-r-[calc(var(--radius-md)-1px)] border-l border-border px-2 outline-none transition-colors hover:bg-accent/40 focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <IconX className="h-3.5 w-3.5 opacity-60" />
          </button>
        </div>
      ) : (
        <PopoverTrigger asChild>
          <button
            type="button"
            data-slot="filter-button"
            data-state="inactive"
            className={cn(
              filterButtonVariants({ active: false }),
              "items-center gap-1.5 pl-3 pr-2 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              className
            )}
          >
            {label}
            <IconChevronDown className="h-4 w-4 opacity-60" aria-hidden="true" />
          </button>
        </PopoverTrigger>
      )}

      <PopoverContent
        className="p-4"
        style={popoverStyle}
        aria-label={`Filter: ${label}`}
      >
        <div className="space-y-4">
          {children(draft, setDraft)}
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" onClick={handleClear}>
              Clear
            </Button>
            <Button onClick={handleApply}>Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { FilterButton, filterButtonVariants };
export type { FilterButtonProps };
