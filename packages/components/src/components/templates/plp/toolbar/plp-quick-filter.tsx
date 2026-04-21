"use client";

import { useState, type ReactNode } from "react";
import { FilterButton } from "../../../atoms/filter-button/filter-button";

export interface PlpQuickFilterProps<V> {
  /** Filter label (e.g. "Colour"). Always shown on the button. */
  label: string;
  /**
   * Formatted summary of the current applied value (e.g. "Blue, Green +3").
   * Provide when the filter is active; omit when it is not. Consumers own
   * the formatting — the library does not ship a chip formatter.
   */
  chipSummary?: string;
  /** Whether the filter currently has an applied value. */
  isActive: boolean;
  /**
   * Value to seed the popover's draft with each time the popover opens.
   * Usually the consumer's applied value for this filter. Drafts are
   * discarded when the popover closes without applying.
   */
  initialValue: V | undefined;
  /** Optional fixed width for the popover (CSS value or pixel number). */
  popoverWidth?: number | string;
  /** Fired with the draft value when the user clicks Apply inside the popover. */
  onApply: (value: V | undefined) => void;
  /** Fired when the user clicks Clear inside the popover. */
  onClear: () => void;
  /**
   * Fired when the user clicks the dismiss X on the active chip (if any).
   * Only rendered when `isActive` is true; omit to hide the X.
   */
  onDismiss?: () => void;
  /**
   * Render function for the filter control. Receives the current draft
   * value and a setter. The draft lifecycle (seed on open, reset to the
   * current applied value each time the popover opens, commit on apply)
   * is managed here — the consumer only writes the controlled filter
   * component against `draft` and `setDraft`.
   */
  children: (draft: V | undefined, setDraft: (v: V | undefined) => void) => ReactNode;
}

/**
 * Toolbar-row filter control.
 *
 * Wraps a `FilterButton` with a per-popover draft state lifecycle:
 *
 * - Each time the popover opens, the draft is reseeded from `initialValue`
 *   so the popover always starts from the currently-applied value.
 * - Edits mutate the draft only; the consumer's applied state is not
 *   touched until the user clicks Apply.
 * - Apply commits the draft through `onApply`; Clear commits `undefined`
 *   through `onClear`; the dismiss X on the active chip fires `onDismiss`
 *   without opening the popover.
 *
 * The preset control is provided as a render-prop child so each consumer
 * picks which filter component to render for this quick filter — the
 * library no longer maintains a registry.
 */
export function PlpQuickFilter<V>({
  label,
  chipSummary,
  isActive,
  initialValue,
  popoverWidth,
  onApply,
  onClear,
  onDismiss,
  children,
}: PlpQuickFilterProps<V>) {
  const [draft, setDraft] = useState<V | undefined>(initialValue);

  function handleOpenChange(open: boolean) {
    if (open) {
      setDraft(initialValue);
    }
  }

  function handleApply() {
    onApply(draft);
  }

  function handleClear() {
    setDraft(undefined);
    onClear();
  }

  return (
    <FilterButton
      label={label}
      valueSummary={isActive ? chipSummary : undefined}
      popoverWidth={popoverWidth}
      onOpenChange={handleOpenChange}
      onApply={handleApply}
      onClear={handleClear}
      onDismiss={isActive ? onDismiss : undefined}
    >
      {children(draft, setDraft)}
    </FilterButton>
  );
}
