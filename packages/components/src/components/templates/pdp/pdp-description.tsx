import { cn } from "@/lib/utils";
import { Typography } from "../../atoms/typography/typography";
import type { PdpDescriptionProps } from "./pdp-types";

/**
 * Typography wrapper for freeform product description.
 * No opinion on content format — raw strings, CMS output, and rich HTML are all valid as children.
 */
export function PdpDescription({ children, className }: PdpDescriptionProps) {
  return (
    <div className={cn("text-muted-foreground", className)} data-slot="pdp-description">
      {typeof children === "string" ? <Typography variant="body-2">{children}</Typography> : children}
    </div>
  );
}
