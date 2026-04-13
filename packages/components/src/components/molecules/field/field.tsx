import * as React from "react"

import { cn } from "@/lib/utils"

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Wraps a label, input, and helper/error text into a vertical stack
 * with consistent spacing. The standard container for form fields.
 */
const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="field"
      className={cn("space-y-2", className)}
      {...props}
    />
  )
)
Field.displayName = "Field"

export { Field }
