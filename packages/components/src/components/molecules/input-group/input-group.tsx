import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Groups related input elements (e.g. an input with an addon or icon)
 * into a single visual unit.
 */
const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="input-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
)
InputGroup.displayName = "InputGroup"

export { InputGroup }
