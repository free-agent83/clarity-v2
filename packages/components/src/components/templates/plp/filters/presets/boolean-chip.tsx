"use client";

import { cn } from "@/lib/utils";
import type { FilterControlProps } from "../../plp-types";

/**
 * Boolean on/off filter control.
 *
 * Renders as a single toggleable chip. When active, shows a filled visual
 * state with a checkmark. The label text is supplied via the `chipLabel`
 * field on the filter definition — it reaches this component through the
 * `options` prop as a single-element array with the label as its `label`.
 *
 * If no options are provided, renders a generic "Enabled" / disabled state.
 */
export function BooleanChipFilter({ value, onChange, options }: FilterControlProps) {
  const isActive = value === true;
  const label = options?.[0]?.label ?? "Enabled";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-muted"
      )}
      onClick={() => onChange(isActive ? undefined : true)}
    >
      {isActive && (
        <svg
          className="mr-1.5 h-3.5 w-3.5"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {label}
    </button>
  );
}
