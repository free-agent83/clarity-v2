import * as React from "react"

import { cn } from "@/lib/utils"

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

/**
 * Keyboard shortcut indicator for displaying key combinations.
 *
 * Renders an inline `<kbd>` element styled to look like a physical key.
 * Use inside tooltips, menu items, or inline text to communicate
 * keyboard shortcuts to users.
 */
const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, ...props }, ref) => (
    <kbd
      ref={ref}
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
)
Kbd.displayName = "Kbd"

export { Kbd }
