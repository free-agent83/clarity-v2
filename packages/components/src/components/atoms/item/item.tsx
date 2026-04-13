import * as React from "react"

import { cn } from "@/lib/utils"

export interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * A generic layout primitive for list-like item rows.
 *
 * Renders a flex container with centered alignment and consistent
 * gap/padding, suitable for lists, menus, and grouped content.
 */
const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-2 p-2", className)}
      {...props}
    />
  )
)
Item.displayName = "Item"

export { Item }
