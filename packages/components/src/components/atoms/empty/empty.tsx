import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Empty-state placeholder for sections with no content.
 *
 * Renders centred children, or a default "No content" message when no
 * children are provided. Use inside cards, tables, or list views to
 * communicate that a dataset or section is intentionally blank.
 */
export interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="empty"
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
      {...props}
    >
      {children ?? (
        <p className="text-sm text-muted-foreground">No content</p>
      )}
    </div>
  )
)
Empty.displayName = "Empty"

export { Empty }
