import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/atoms/checkbox/checkbox"

/**
 * Returns a pre-built column definition for row selection.
 *
 * Renders a header checkbox with indeterminate state support and a per-row
 * checkbox. Must be used together with `enableRowSelection: true` in the
 * DataTable config — providing one without the other is a runtime error.
 *
 * @returns A `ColumnDef<TData>` with `id: "select"`, sorting and hiding disabled.
 *
 * @example
 * ```ts
 * const config: DataTableConfig<Row> = {
 *   columns: [getSelectColumn<Row>(), ...otherColumns],
 *   enableRowSelection: true,
 * }
 * ```
 */
function getSelectColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }
}

export { getSelectColumn }
