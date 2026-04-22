import { cn } from "@/lib/utils";
import { Typography } from "../../atoms/typography/typography";
import type { PdpHeadingProps } from "./pdp-types";

/**
 * Product name rendered as H3 (prominent heading), with optional SKU as a muted caption below.
 * Sits at the top of the PdpLayout body slot.
 */
export function PdpHeading({ name, sku, className }: PdpHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)} data-slot="pdp-heading">
      <Typography variant="h3">{name}</Typography>
      {sku && (
        <Typography variant="caption" className="text-muted-foreground">
          {sku}
        </Typography>
      )}
    </div>
  );
}
