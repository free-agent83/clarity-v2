import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Props for the DataTable component.
 */
export interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Placeholder for a full-featured data table built on @tanstack/react-table + Table.
 *
 * This is a scaffold that will be replaced with a complete implementation
 * providing sorting, filtering, pagination, and row selection once
 * @tanstack/react-table is integrated.
 */
const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {children ?? (
        <p className="text-sm text-muted-foreground p-4">
          [DataTable — built on @tanstack/react-table + Table]
        </p>
      )}
    </div>
  )
)
DataTable.displayName = "DataTable"

export { DataTable }
