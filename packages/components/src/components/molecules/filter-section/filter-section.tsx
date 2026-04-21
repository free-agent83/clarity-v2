"use client";

import { type ReactNode } from "react";
import { Separator } from "../../atoms/separator/separator";
import { Typography } from "../../atoms/typography/typography";

export interface FilterSectionProps {
  label: string;
  children: ReactNode;
  /**
   * When false, suppresses the leading separator. Set `false` on the
   * first section of a drawer to avoid a redundant top rule.
   * Defaults to `true`.
   */
  separator?: boolean;
}

/**
 * Thin wrapper for a single filter entry inside a FilterDrawer. Renders
 * an optional leading separator, a heading, and the filter control.
 *
 * Exists so consumers don't re-implement the per-section heading +
 * separator scaffold for every drawer they render.
 */
export function FilterSection({
  label,
  children,
  separator = true,
}: FilterSectionProps) {
  return (
    <div data-slot="filter-section">
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
