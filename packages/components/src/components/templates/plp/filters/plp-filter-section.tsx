"use client";

import { type ReactNode } from "react";
import { Separator } from "../../../atoms/separator/separator";
import { Typography } from "../../../atoms/typography/typography";

export interface PlpFilterSectionProps {
  /** Section heading shown above the filter control. */
  label: string;
  /** The filter control. */
  children: ReactNode;
  /**
   * When false, suppresses the leading separator. Defaults to `true` so
   * consumers rendering a list of sections inside the drawer body get
   * consistent inter-section spacing; set `false` on the first section
   * to avoid a redundant top rule.
   */
  separator?: boolean;
}

/**
 * Thin container for a single filter entry inside the drawer body —
 * renders a leading separator (optional), a heading, and the filter
 * control.
 *
 * The drawer itself is shape-agnostic; this primitive exists so
 * consumers don't have to re-implement the per-section heading +
 * separator scaffold for every drawer they render.
 */
export function PlpFilterSection({
  label,
  children,
  separator = true,
}: PlpFilterSectionProps) {
  return (
    <div data-slot="plp-filter-section">
      {separator && <Separator className="my-4" />}
      <div className="space-y-3">
        <Typography as="h3" variant="body-2" emphasis>
          {label}
        </Typography>
        {children}
      </div>
    </div>
  );
}
