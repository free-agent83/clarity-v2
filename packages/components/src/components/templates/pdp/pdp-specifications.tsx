import { cn } from "@/lib/utils";
import { Typography } from "../../atoms/typography/typography";
import type { PdpSpecificationsProps } from "./pdp-types";

/**
 * Two-column key-value spec table. Consumer provides all rows; values are
 * ReactNode so badges, links, and formatted strings all work.
 *
 * `heading` defaults to "Specifications" but can be overridden for
 * category-specific sections (e.g. "Stone details").
 */
export function PdpSpecifications({ rows, heading = "Specifications", className }: PdpSpecificationsProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)} data-slot="pdp-specifications">
      <Typography as="h2" variant="h4">
        {heading}
      </Typography>
      <dl className="divide-y divide-border">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-baseline justify-between gap-4 py-3 last:border-0">
            <dt>
              <Typography variant="body-2" className="text-muted-foreground">
                {label}
              </Typography>
            </dt>
            <dd className="text-right">
              <Typography variant="body-2" className="font-medium">
                {value}
              </Typography>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
