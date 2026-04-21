"use client";

import { type ReactNode } from "react";
import { Button } from "../../../atoms/button/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "../../../molecules/sheet/sheet";

export interface PlpFilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Fired when the user clicks the primary "Show results" action. The
   * consumer commits its draft filter state here and typically closes
   * the drawer.
   */
  onApply: () => void;
  /**
   * Fired when the user clicks the header "Clear" action. Only rendered
   * when `hasActiveDraft` is true and `onClearDraft` is provided.
   */
  onClearDraft?: () => void;
  /**
   * Whether the current draft has any active filters. When true and
   * `onClearDraft` is provided, the header shows a Clear action.
   */
  hasActiveDraft?: boolean;
  /**
   * Preview count for the primary action — "Show X results". When
   * omitted, the button reads "Show results".
   */
  resultsCount?: number;
  /**
   * When true, the primary action shows a loading state (spinner,
   * disabled) — use while a preview-count request is in flight.
   */
  isCountLoading?: boolean;
  /**
   * Filter sections, one per filter. Compose with `PlpFilterSection`
   * wrapping each preset control. The drawer itself is shape-agnostic.
   */
  children: ReactNode;
}

/**
 * All Filters drawer — a left-side Sheet housing the complete filter list.
 *
 * The drawer is a presentational container: it renders the Sheet shell,
 * an optional header Clear action, a scrollable body that flows the
 * consumer-provided filter sections, and a sticky footer with a
 * results-count-aware primary action.
 *
 * Filter state (applied, drafted) is entirely the consumer's concern.
 * The library does not buffer a draft, diff against the applied state,
 * or fan changes out per filter — the consumer writes each filter
 * component inside the drawer's children controlled against its own
 * draft state and commits on `onApply`.
 */
export function PlpFilterDrawer({
  open,
  onOpenChange,
  onApply,
  onClearDraft,
  hasActiveDraft = false,
  resultsCount,
  isCountLoading = false,
  children,
}: PlpFilterDrawerProps) {
  const formattedCount =
    resultsCount !== undefined
      ? new Intl.NumberFormat("en-US").format(resultsCount)
      : null;

  const showClear = hasActiveDraft && !!onClearDraft;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-full max-w-sm flex-col"
        aria-label="All filters"
      >
        <SheetHeader className="flex-row items-center justify-between pr-10">
          <SheetTitle>Filters</SheetTitle>
          {showClear && (
            <Button variant="link" size="sm" onClick={onClearDraft}>
              Clear
            </Button>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        <SheetFooter className="border-t px-6 py-4">
          <Button
            block
            onClick={onApply}
            loading={isCountLoading}
            disabled={isCountLoading}
          >
            {formattedCount ? `Show ${formattedCount} results` : "Show results"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
