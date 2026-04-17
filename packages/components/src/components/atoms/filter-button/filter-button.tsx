"use client";

import * as React from "react";
import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
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
 *   the button shows `label: valueSummary` and an inline dismiss X; in the
 *   inactive state the button shows just `label`.
 *
 * Only one visual variant is supported (outline, styled to match Button's
 * outline variant). Active state uses the same border and a filled tint
 * to indicate engagement — no separate "primary" or "filled" variant.
 */
const filterButtonVariants = cva(
  [
    // Layout
    "group/filter-button inline-flex h-11 shrink-0 items-stretch overflow-hidden rounded-md border text-sm font-medium whitespace-nowrap transition-[color,background,box-shadow]",
    // Disabled
    "has-disabled:pointer-events-none has-disabled:opacity-50",
    // Keyboard focus — bubble individual button's :focus-visible up to the
    // container so the ring wraps the whole unit cleanly.
    "has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
  ],
  {
    variants: {
      active: {
        true: "border-border bg-muted text-foreground dark:border-input dark:bg-input/50",
        false:
          "border-border bg-background hover:bg-muted hover:text-primary-hover dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

interface FilterButtonProps extends VariantProps<typeof filterButtonVariants> {
  /** Filter label, always shown (e.g. "Color"). */
  label: string;
  /**
   * Formatted display of the current filter value (e.g. "Blue, Green +3").
   * When provided, the button renders in the active state showing
   * `label: valueSummary` with an inline dismiss X. Omit for the empty
   * / inactive state showing just `label`.
   */
  valueSummary?: string;
  /** Optional fixed width for the popover (CSS value or pixel number). */
  popoverWidth?: number | string;
  /**
   * Called when the user clicks the dismiss X on an active filter
   * button. Required in the active state; ignored in the inactive state.
   */
  onDismiss?: () => void;
  /**
   * Called when the user clicks Apply inside the popover. The popover
   * closes automatically after this fires.
   */
  onApply: () => void;
  /**
   * Called when the user clicks Clear inside the popover. The popover
   * closes automatically after this fires.
   */
  onClear: () => void;
  /** Controlled popover open state. */
  open?: boolean;
  /**
   * Called when the popover open state changes. Useful for resetting
   * a draft value when the popover opens (fires with `true`).
   */
  onOpenChange?: (open: boolean) => void;
  /** Filter control rendered inside the popover body, above Apply/Clear. */
  children: React.ReactNode;
  /** Extra classes on the outer control element. */
  className?: string;
}

/**
 * FilterButton — a two-state control for applied filters.
 *
 * **Inactive state** (no `valueSummary`): renders a single outline button
 * showing the filter label with a trailing chevron-down icon indicating
 * that the button opens a popover. Clicking opens the popover.
 *
 * **Active state** (with `valueSummary`): renders a split control with a
 * main clickable area showing `label: valueSummary` (opens the popover
 * for editing) and an inline dismiss X (clears the filter via
 * `onDismiss`). The two regions share a single rounded outline and a
 * unified focus ring, so the control reads as one unit while exposing
 * two distinct keyboard / click targets.
 *
 * The popover always includes Apply / Clear actions below the consumer's
 * filter control (passed as `children`). Both close the popover
 * automatically after calling their respective callbacks. Consumers own
 * draft state externally — typically reset it on the `onOpenChange(true)`
 * callback.
 *
 * Styling is modelled on Button's `outline` variant; the active state
 * uses a filled `bg-muted` tint to indicate engagement.
 *
 * @see {@link filterButtonVariants} for the full variant matrix.
 */
function FilterButton({
  label,
  valueSummary,
  popoverWidth,
  onDismiss,
  onApply,
  onClear,
  open: openProp,
  onOpenChange,
  children,
  className,
}: FilterButtonProps) {
  const [openInternal, setOpenInternal] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openInternal;

  function setOpen(next: boolean) {
    if (!isControlled) setOpenInternal(next);
    onOpenChange?.(next);
  }

  function handleApply() {
    onApply();
    setOpen(false);
  }

  function handleClear() {
    onClear();
    setOpen(false);
  }

  const isActive = valueSummary !== undefined;
  const popoverStyle: React.CSSProperties | undefined = popoverWidth
    ? {
        width:
          typeof popoverWidth === "number"
            ? `${popoverWidth}px`
            : popoverWidth,
      }
    : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
              className="flex items-center gap-1.5 px-3 outline-none hover:bg-accent/40 focus-visible:bg-accent/40 transition-colors"
            >
              <span className="text-muted-foreground">{label}:</span>
              <span>{valueSummary}</span>
            </button>
          </PopoverTrigger>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss?.();
            }}
            aria-label={`Remove filter: ${label}`}
            className="flex items-center border-l border-border px-2 outline-none hover:bg-accent/40 focus-visible:bg-accent/40 transition-colors"
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
              "items-center gap-1.5 pl-3 pr-2 outline-none",
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
          {children}
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
