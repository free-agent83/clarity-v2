import * as React from "react"

import { cn } from "@/lib/utils"

export interface ComboboxProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Autocomplete input composed from Popover + Command.
 *
 * This is a placeholder implementation. The full version will compose
 * Popover, Command, and Input into a searchable dropdown.
 */
const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="combobox"
      className={cn("relative", className)}
      {...props}
    >
      {children ?? (
        <span className="text-muted-foreground text-sm">
          [Combobox — composed from Popover + Command]
        </span>
      )}
    </div>
  )
)
Combobox.displayName = "Combobox"

export { Combobox }
