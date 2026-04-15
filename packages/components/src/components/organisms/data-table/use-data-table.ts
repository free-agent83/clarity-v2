import type { DataTableConfig } from "./data-table-types"

function validateConfig<TData>(config: DataTableConfig<TData>): void {
  const hasSelectColumn = config.columns.some(
    (col) => "id" in col && col.id === "select"
  )

  if (config.enableRowSelection && !hasSelectColumn) {
    throw new Error(
      'DataTable: enableRowSelection is true but no column with id "select" exists. ' +
        "Add getSelectColumn() to your columns array."
    )
  }

  if (hasSelectColumn && !config.enableRowSelection) {
    throw new Error(
      'DataTable: A column with id "select" exists but enableRowSelection is not true. ' +
        "Set enableRowSelection: true in your config."
    )
  }
}

export { validateConfig }
