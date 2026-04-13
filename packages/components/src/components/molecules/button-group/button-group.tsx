import * as React from "react"

import { cn } from "@/lib/utils"

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Groups related buttons into a single visual unit with connected borders.
 *
 * Strips border-radius from inner buttons and applies it only to the
 * first and last child, creating a seamless horizontal toolbar effect.
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button variant="outlined">Left</Button>
 *   <Button variant="outlined">Center</Button>
 *   <Button variant="outlined">Right</Button>
 * </ButtonGroup>
 * ```
 */
const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center [&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg",
        className
      )}
      role="group"
      {...props}
    />
  )
)
ButtonGroup.displayName = "ButtonGroup"

export { ButtonGroup }
