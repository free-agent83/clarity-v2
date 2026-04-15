import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

interface SeparatorProps
  extends React.ComponentProps<typeof SeparatorPrimitive.Root> {}

/**
 * Visual divider between groups of content.
 *
 * Wraps Radix `Separator.Root`. Defaults to horizontal orientation;
 * pass `orientation="vertical"` for a vertical divider. Pass
 * `decorative={false}` when the separator carries semantic meaning
 * for assistive tech.
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator };
export type { SeparatorProps };
