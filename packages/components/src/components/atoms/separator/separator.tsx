"use client"

import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Props for the {@link Separator} component.
 *
 * Extends the Radix UI Separator primitive props — see
 * {@link https://www.radix-ui.com/primitives/docs/components/separator Radix docs}
 * for the full set of supported attributes.
 */
export interface SeparatorProps
  extends React.ComponentProps<typeof SeparatorPrimitive.Root> {}

/**
 * A visual divider between content sections, rendered as a horizontal or
 * vertical line.
 *
 * Wraps the Radix UI Separator primitive with Clarity V2 token styling.
 * Set `orientation="vertical"` for inline dividers between sibling elements.
 * Defaults to `decorative={true}`, which hides the element from assistive
 * technology — set to `false` only when the separator conveys meaningful
 * structural information.
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
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
