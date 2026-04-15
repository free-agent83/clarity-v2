---
name: DataTable
slug: data-table
version: 0.1.0
status: unstable
lastUpdated: 2026-04-15
---

# DataTable

A configuration-driven data table component built on TanStack Table. Owns all table state internally — the consuming engineer provides a `config` object and a `data` array, and the component handles sorting, filtering, pagination, and row selection.

Designed for data-heavy views: dashboards, list pages, admin panels.

## Props

### DataTable

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TData[]` | — | The data array to display |
| `config` | `DataTableConfig<TData>` | — | Configuration object driving all table behaviour |
| `loading` | `boolean` | `false` | When true, renders skeleton placeholder rows |

### DataTableConfig

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<TData>[]` | — | TanStack Table column definitions |
| `pagination` | `DataTablePaginationConfig` | — | Pagination options |
| `enableRowSelection` | `boolean` | `false` | Enable row selection checkboxes |
| `selectionActions` | `(rows, clearSelection) => ReactNode` | — | Custom actions rendered in the selection bar |
| `emptyState` | `ReactNode` | `"No results."` | Custom empty state content |

### DataTablePaginationConfig

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageSizeOptions` | `number[]` | `[10, 20, 30, 40, 50]` | Available page sizes. First value is the default. |

### DataTableHeader / DataTableCell

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Cell content |
| `className` | `string` | — | Additional CSS classes |

## Usage guidelines

**Do** use DataTable for data-heavy views with pagination, sorting, or row selection.

**Don't** use DataTable for simple, small, static tables — use the Table organism directly instead.

**Don't** lift table state to the page level. DataTable owns all state internally. Use `selectionActions` to react to selection, not external state management.

## Best practices

**Do:** Define columns outside the component to avoid re-creation on every render.

```tsx
// Good — stable reference
const columns: ColumnDef<Product>[] = [
  { accessorKey: "name", header: "Name" },
]

function Page() {
  return <DataTable data={data} config={{ columns }} />
}
```

**Don't:** Define columns inline inside JSX.

```tsx
// Bad — new array on every render
function Page() {
  return (
    <DataTable
      data={data}
      config={{
        columns: [{ accessorKey: "name", header: "Name" }],
      }}
    />
  )
}
```

**Do:** Use `getSelectColumn()` with `enableRowSelection: true` — both are required.

**Don't:** Provide `getSelectColumn()` without `enableRowSelection` or vice versa — this is a runtime error.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Responsive: pagination adapts (rows-per-page and first/last hidden on mobile)
- [x] Tokens only: no hardcoded visual values
