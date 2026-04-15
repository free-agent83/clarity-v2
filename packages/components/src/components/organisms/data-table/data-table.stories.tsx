import React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { userEvent, within, expect, waitFor } from "@storybook/test"
import { DataTable } from "./data-table"
import type { DataTableConfig } from "./data-table-types"
import { getSelectColumn } from "./data-table-helpers"
import { Badge } from "@/components/atoms/badge/badge"
import { Button } from "@/components/atoms/button/button"
import type { ColumnDef } from "@tanstack/react-table"

// --- Mock data ---

interface Product {
  id: string
  name: string
  category: string
  price: number
  status: "active" | "draft" | "archived"
}

const products: Product[] = Array.from({ length: 42 }, (_, i) => ({
  id: `PRD-${String(i + 1).padStart(3, "0")}`,
  name: `Product ${i + 1}`,
  category: ["Rings", "Necklaces", "Earrings", "Bracelets"][i % 4],
  price: Math.round(((i + 1) * 37.5 + 50) * 100) / 100,
  status: (["active", "draft", "archived"] as const)[i % 3],
}))

const baseColumns: ColumnDef<Product, unknown>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => `$${row.original.price.toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge size="sm" variant="outline">{row.original.status}</Badge>,
  },
]

// --- Fake server helpers ---

interface FetchParams {
  sorting?: { id: string; desc: boolean }[]
  filters?: { id: string; value: unknown }[]
  search?: string
  pagination: { pageIndex: number; pageSize: number }
}

interface FetchResult {
  data: Product[]
  totalRows: number
}

function createFakeServerFetcher(allData: Product[]) {
  return async (params: FetchParams): Promise<FetchResult> => {
    await new Promise((r) => setTimeout(r, 500))
    let result = [...allData]

    // Search
    if (params.search) {
      const term = params.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
      )
    }

    // Filters
    if (params.filters) {
      for (const f of params.filters) {
        if (Array.isArray(f.value)) {
          result = result.filter((p) =>
            (f.value as string[]).includes(
              String(p[f.id as keyof Product])
            )
          )
        } else if (
          Array.isArray(f.value) === false &&
          typeof f.value === "object" &&
          f.value !== null
        ) {
          const [min, max] = f.value as [number, number]
          result = result.filter((p) => {
            const val = p[f.id as keyof Product] as number
            return val >= min && val <= max
          })
        }
      }
    }

    // Sorting
    if (params.sorting?.length) {
      const sort = params.sorting[0]
      result.sort((a, b) => {
        const aVal = a[sort.id as keyof Product]
        const bVal = b[sort.id as keyof Product]
        if (aVal < bVal) return sort.desc ? 1 : -1
        if (aVal > bVal) return sort.desc ? -1 : 1
        return 0
      })
    }

    const totalRows = result.length
    const start = params.pagination.pageIndex * params.pagination.pageSize
    const paged = result.slice(start, start + params.pagination.pageSize)

    return { data: paged, totalRows }
  }
}

const fakeFetch = createFakeServerFetcher(products)

function ServerSideWrapper({
  config,
  initialPageSize = 10,
}: {
  config: Omit<DataTableConfig<Product>, "columns"> & { columns?: ColumnDef<Product, unknown>[] }
  initialPageSize?: number
}) {
  const [data, setData] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [totalRows, setTotalRows] = React.useState(0)
  const paramsRef = React.useRef<FetchParams>({
    pagination: { pageIndex: 0, pageSize: initialPageSize },
  })

  const doFetch = React.useCallback(async () => {
    setLoading(true)
    const result = await fakeFetch(paramsRef.current)
    setData(result.data)
    setTotalRows(result.totalRows)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    doFetch()
  }, [doFetch])

  const serverSide = React.useMemo(
    () => ({
      totalRows,
      onSortChange: (sorting: { id: string; desc: boolean }[]) => {
        paramsRef.current.sorting = sorting
        paramsRef.current.pagination.pageIndex = 0
        doFetch()
      },
      onFilterChange: (columnId: string, value: unknown) => {
        const filters = paramsRef.current.filters ?? []
        const idx = filters.findIndex((f) => f.id === columnId)
        if (idx >= 0) {
          filters[idx] = { id: columnId, value }
        } else {
          filters.push({ id: columnId, value })
        }
        paramsRef.current.filters = filters
        paramsRef.current.pagination.pageIndex = 0
        doFetch()
      },
      onSearchChange: (search: string) => {
        paramsRef.current.search = search
        paramsRef.current.pagination.pageIndex = 0
        doFetch()
      },
      onPageChange: (pagination: { pageIndex: number; pageSize: number }) => {
        paramsRef.current.pagination = pagination
        doFetch()
      },
      onClearAll: () => {
        paramsRef.current = {
          pagination: { ...paramsRef.current.pagination, pageIndex: 0 },
        }
        doFetch()
      },
    }),
    [totalRows, doFetch]
  )

  return (
    <DataTable
      data={data}
      loading={loading}
      config={{
        columns: config.columns ?? baseColumns,
        ...config,
        serverSide,
      }}
    />
  )
}

function LiveAPIWrapper() {
  const [data, setData] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [totalRows, setTotalRows] = React.useState(0)
  const paramsRef = React.useRef({
    pagination: { pageIndex: 0, pageSize: 10 },
    search: "",
    sortBy: "",
    order: "" as "asc" | "desc" | "",
  })

  const doFetch = React.useCallback(async () => {
    setLoading(true)
    const p = paramsRef.current
    const skip = p.pagination.pageIndex * p.pagination.pageSize
    const limit = p.pagination.pageSize

    let url = p.search
      ? `https://dummyjson.com/products/search?q=${encodeURIComponent(p.search)}&limit=${limit}&skip=${skip}`
      : `https://dummyjson.com/products?limit=${limit}&skip=${skip}`

    if (p.sortBy) {
      url += `&sortBy=${p.sortBy}&order=${p.order}`
    }

    try {
      const res = await fetch(url)
      const json = await res.json()
      const mapped: Product[] = json.products.map(
        (item: { id: number; title: string; category: string; price: number; availabilityStatus: string }) => ({
          id: `PRD-${String(item.id).padStart(3, "0")}`,
          name: item.title,
          category: item.category,
          price: item.price,
          status: (item.availabilityStatus === "In Stock" ? "active" : "draft") as Product["status"],
        })
      )
      setData(mapped)
      setTotalRows(json.total)
    } catch {
      setData([])
      setTotalRows(0)
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    doFetch()
  }, [doFetch])

  return (
    <DataTable
      data={data}
      loading={loading}
      config={{
        columns: baseColumns,
        toolbar: {
          search: {
            placeholder: "Search DummyJSON products (press Enter)...",
            columnIds: ["name", "category"],
          },
          sorting: [
            { label: "Price, high to low", columnId: "price", direction: "desc" },
            { label: "Price, low to high", columnId: "price", direction: "asc" },
            { label: "Name A–Z", columnId: "name", direction: "asc" },
          ],
        },
        serverSide: {
          totalRows,
          onSearchChange: (search) => {
            paramsRef.current.search = search
            paramsRef.current.pagination.pageIndex = 0
            doFetch()
          },
          onSortChange: (sorting) => {
            if (sorting.length) {
              paramsRef.current.sortBy = sorting[0].id
              paramsRef.current.order = sorting[0].desc ? "desc" : "asc"
            } else {
              paramsRef.current.sortBy = ""
              paramsRef.current.order = ""
            }
            paramsRef.current.pagination.pageIndex = 0
            doFetch()
          },
          onPageChange: (pagination) => {
            paramsRef.current.pagination = pagination
            doFetch()
          },
          onClearAll: () => {
            paramsRef.current = {
              pagination: { ...paramsRef.current.pagination, pageIndex: 0 },
              search: "",
              sortBy: "",
              order: "",
            }
            doFetch()
          },
        },
      }}
    />
  )
}

// --- Meta ---

const meta: Meta<typeof DataTable<Product>> = {
  title: "Data/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
}

export default meta
type Story = StoryObj<typeof DataTable<Product>>

// --- Stories ---

export const Default: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify table renders with rows: 1 header row + 10 data rows (default page size)
    const rows = canvas.getAllByRole("row")
    await expect(rows.length).toBe(11)

    // Verify pagination shows page info
    const pageInfo = canvas.getByText(/Page 1 of/)
    await expect(pageInfo).toBeInTheDocument()
  },
}

export const WithSelection: Story = {
  args: {
    data: products,
    config: {
      columns: [getSelectColumn<Product>(), ...baseColumns],
      enableRowSelection: true,
      selectionActions: (_rows, clearSelection) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => clearSelection()}
        >
          Delete selected
        </Button>
      ),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click the first data row checkbox ([0] is the header checkbox)
    const checkboxes = canvas.getAllByRole("checkbox")
    await userEvent.click(checkboxes[1])

    // Verify selection bar appears with count and actions
    const selectionText = canvas.getByText(/1 row\(s\) selected/)
    await expect(selectionText).toBeInTheDocument()

    const deleteButton = canvas.getByRole("button", { name: /Delete selected/ })
    await expect(deleteButton).toBeInTheDocument()

    const clearButton = canvas.getByRole("button", { name: /Clear selection/ })
    await expect(clearButton).toBeInTheDocument()
  },
}

export const Loading: Story = {
  args: {
    data: [],
    config: {
      columns: baseColumns,
    },
    loading: true,
  },
  play: async ({ canvasElement }) => {
    // Verify skeleton cells are rendered
    const skeletons = canvasElement.querySelectorAll('[data-slot="skeleton"]')
    await expect(skeletons.length).toBeGreaterThan(0)
  },
}

export const Empty: Story = {
  args: {
    data: [],
    config: {
      columns: baseColumns,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emptyText = canvas.getByText("No results.")
    await expect(emptyText).toBeInTheDocument()
  },
}

export const CustomEmptyState: Story = {
  args: {
    data: [],
    config: {
      columns: baseColumns,
      emptyState: (
        <div className="flex flex-col items-center gap-2 py-8">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or add a new product.
          </p>
        </div>
      ),
    },
  },
}

export const CustomPageSizes: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
      pagination: {
        pageSizeOptions: [5, 10, 25, 50],
      },
    },
  },
}

export const WithSearch: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
      toolbar: {
        search: {
          placeholder: "Search products...",
          columnIds: ["name", "category"],
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify toolbar renders with search input
    const searchInput = canvas.getByPlaceholderText("Search products...")
    await expect(searchInput).toBeInTheDocument()

    // Type a search term — "Necklaces" is a unique category match
    await userEvent.type(searchInput, "Necklaces")

    // Wait for debounce (300ms) + React re-render cycle
    await waitFor(
      () => {
        const rows = canvasElement.querySelectorAll("tbody tr")
        // 42 products / 4 categories = ~11 "Necklaces" rows, but paginated to 10
        // After filtering, only ~11 rows match, so first page shows 10 or fewer
        expect(rows.length).toBeLessThanOrEqual(10)
        // Verify at least one row contains "Necklaces"
        const firstRowText = rows[0]?.textContent ?? ""
        expect(firstRowText).toMatch(/Necklaces/)
      },
      { timeout: 3000 }
    )

    // Clear search via × button
    const clearButton = canvas.getByRole("button", { name: "Clear search" })
    await userEvent.click(clearButton)

    // Verify rows are restored (default page size = 10)
    await waitFor(
      () => {
        const restoredRows = canvasElement.querySelectorAll("tbody tr")
        expect(restoredRows.length).toBe(10)
      },
      { timeout: 3000 }
    )
  },
}

export const WithSorting: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
      toolbar: {
        sorting: [
          { label: "Price, high to low", columnId: "price", direction: "desc" },
          { label: "Price, low to high", columnId: "price", direction: "asc" },
          { label: "Name A–Z", columnId: "name", direction: "asc" },
          { label: "Name Z–A", columnId: "name", direction: "desc" },
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // Verify sort button renders with default label
    const sortButton = canvas.getByRole("button", { name: /Sort/ })
    await expect(sortButton).toBeInTheDocument()

    // Open sort dropdown
    await userEvent.click(sortButton)

    // Select "Price, high to low" — dropdown renders in a Radix portal on document.body
    const option = body.getByRole("menuitemradio", {
      name: "Price, high to low",
    })
    await userEvent.click(option)

    // Verify trigger now shows active sort label
    await waitFor(() => {
      expect(canvas.getByRole("button", { name: /Price, high to low/ })).toBeInTheDocument()
    })

    // Verify first data row has the highest price
    // Products: price = round((i+1)*37.5 + 50, 2). Product 42 = round(42*37.5+50, 2) = $1,625.00
    const firstDataRow = canvasElement.querySelectorAll("tbody tr")[0]
    const priceCell = firstDataRow?.querySelectorAll("td")[3]
    await expect(priceCell?.textContent).toBe("$1625.00")
  },
}

export const FullToolbar: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
      toolbar: {
        search: {
          placeholder: "Search products...",
          columnIds: ["name", "category"],
        },
        quickFilters: [
          { name: "Category", columnId: "category", type: "checkbox-list" },
          {
            name: "Price",
            columnId: "price",
            type: "interval-slider",
            formatValue: (v: number) => `$${v.toFixed(0)}`,
          },
        ],
        sorting: [
          { label: "Price, high to low", columnId: "price", direction: "desc" },
          { label: "Price, low to high", columnId: "price", direction: "asc" },
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // --- Checkbox filter ---

    // Open the Category filter popover
    const categoryTrigger = canvas.getByRole("button", { name: "Category" })
    await userEvent.click(categoryTrigger)

    // Check two options and apply
    await userEvent.click(body.getByRole("checkbox", { name: "Rings" }))
    await userEvent.click(body.getByRole("checkbox", { name: "Necklaces" }))
    await userEvent.click(body.getByRole("button", { name: "Apply" }))

    // Verify trigger label shows count and rows are filtered
    await waitFor(() => {
      expect(
        canvas.getByRole("button", { name: /Category \(2\)/ })
      ).toBeInTheDocument()
      const rows = canvasElement.querySelectorAll("tbody tr")
      for (const row of rows) {
        expect(row.textContent ?? "").toMatch(/Rings|Necklaces/)
      }
    })

    // --- Clear all ---

    // Verify "Clear all" appears and click it
    const clearAllBtn = canvas.getByRole("button", { name: "Clear all" })
    await expect(clearAllBtn).toBeInTheDocument()
    await userEvent.click(clearAllBtn)

    // Verify everything resets
    await waitFor(() => {
      expect(
        canvas.getByRole("button", { name: "Category" })
      ).toBeInTheDocument()
      expect(
        canvas.queryByRole("button", { name: "Clear all" })
      ).not.toBeInTheDocument()
      const rows = canvasElement.querySelectorAll("tbody tr")
      expect(rows.length).toBe(10)
    })
  },
}

// --- Server-side stories ---

export const ServerSide: Story = {
  render: () => (
    <ServerSideWrapper
      config={{
        columns: baseColumns,
        toolbar: {
          search: {
            placeholder: "Search products (press Enter)...",
            columnIds: ["name", "category"],
          },
          quickFilters: [
            {
              name: "Category",
              columnId: "category",
              type: "checkbox-list",
              serverSide: { options: ["Rings", "Necklaces", "Earrings", "Bracelets"] },
            },
            {
              name: "Price",
              columnId: "price",
              type: "interval-slider",
              formatValue: (v: number) => `$${v.toFixed(0)}`,
              serverSide: { min: 87, max: 1625 },
            },
          ],
          sorting: [
            { label: "Price, high to low", columnId: "price", direction: "desc" },
            { label: "Price, low to high", columnId: "price", direction: "asc" },
            { label: "Name A–Z", columnId: "name", direction: "asc" },
          ],
        },
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Wait for initial load to complete (skeletons disappear, rows appear)
    await waitFor(
      () => {
        const rows = canvasElement.querySelectorAll("tbody tr")
        expect(rows.length).toBe(10)
        // Verify it's not skeleton rows
        const firstRowText = rows[0]?.textContent ?? ""
        expect(firstRowText).toMatch(/PRD-/)
      },
      { timeout: 5000 }
    )

    // Verify pagination shows total
    const pageInfo = canvas.getByText(/Page 1 of/)
    await expect(pageInfo).toBeInTheDocument()
  },
}

export const ServerSideSearch: Story = {
  render: () => (
    <ServerSideWrapper
      config={{
        columns: baseColumns,
        toolbar: {
          search: {
            placeholder: "Search products (press Enter)...",
            columnIds: ["name", "category"],
          },
        },
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Wait for initial load
    await waitFor(
      () => {
        const rows = canvasElement.querySelectorAll("tbody tr")
        expect(rows.length).toBe(10)
      },
      { timeout: 5000 }
    )

    // Type search term
    const searchInput = canvas.getByPlaceholderText(
      "Search products (press Enter)..."
    )
    await userEvent.type(searchInput, "Necklaces")

    // Rows should NOT change yet (server-side: no debounce, Enter required)
    const rowsBefore = canvasElement.querySelectorAll("tbody tr")
    await expect(rowsBefore.length).toBe(10)

    // Press Enter
    await userEvent.keyboard("{Enter}")

    // Wait for filtered results
    await waitFor(
      () => {
        const rows = canvasElement.querySelectorAll("tbody tr")
        expect(rows.length).toBeLessThanOrEqual(10)
        const firstRowText = rows[0]?.textContent ?? ""
        expect(firstRowText).toMatch(/Necklaces/)
      },
      { timeout: 5000 }
    )
  },
}

export const ServerSideSorting: Story = {
  render: () => (
    <ServerSideWrapper
      config={{
        columns: baseColumns,
        toolbar: {
          sorting: [
            { label: "Price, high to low", columnId: "price", direction: "desc" },
            { label: "Price, low to high", columnId: "price", direction: "asc" },
          ],
        },
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // Wait for initial load
    await waitFor(
      () => {
        const rows = canvasElement.querySelectorAll("tbody tr")
        expect(rows.length).toBe(10)
      },
      { timeout: 5000 }
    )

    // Open sort dropdown and select "Price, high to low"
    const sortButton = canvas.getByRole("button", { name: /Sort/ })
    await userEvent.click(sortButton)
    const option = body.getByRole("menuitemradio", {
      name: "Price, high to low",
    })
    await userEvent.click(option)

    // Wait for re-fetch and verify sort
    await waitFor(
      () => {
        expect(
          canvas.getByRole("button", { name: /Price, high to low/ })
        ).toBeInTheDocument()
        const firstDataRow = canvasElement.querySelectorAll("tbody tr")[0]
        const priceCell = firstDataRow?.querySelectorAll("td")[3]
        expect(priceCell?.textContent).toBe("$1625.00")
      },
      { timeout: 5000 }
    )
  },
}

export const ServerSideFilters: Story = {
  render: () => (
    <ServerSideWrapper
      config={{
        columns: baseColumns,
        toolbar: {
          quickFilters: [
            {
              name: "Category",
              columnId: "category",
              type: "checkbox-list",
              serverSide: { options: ["Rings", "Necklaces", "Earrings", "Bracelets"] },
            },
          ],
        },
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // Wait for initial load
    await waitFor(
      () => {
        const rows = canvasElement.querySelectorAll("tbody tr")
        expect(rows.length).toBe(10)
      },
      { timeout: 5000 }
    )

    // Open Category filter and select "Rings"
    const categoryTrigger = canvas.getByRole("button", { name: "Category" })
    await userEvent.click(categoryTrigger)
    await userEvent.click(body.getByRole("checkbox", { name: "Rings" }))
    await userEvent.click(body.getByRole("button", { name: "Apply" }))

    // Wait for filtered results
    await waitFor(
      () => {
        expect(
          canvas.getByRole("button", { name: /Category \(1\)/ })
        ).toBeInTheDocument()
        const rows = canvasElement.querySelectorAll("tbody tr")
        for (const row of rows) {
          expect(row.textContent ?? "").toMatch(/Rings/)
        }
      },
      { timeout: 5000 }
    )

    // Click Clear all
    const clearAllBtn = canvas.getByRole("button", { name: "Clear all" })
    await userEvent.click(clearAllBtn)

    // Wait for reset
    await waitFor(
      () => {
        expect(
          canvas.getByRole("button", { name: "Category" })
        ).toBeInTheDocument()
        const rows = canvasElement.querySelectorAll("tbody tr")
        expect(rows.length).toBe(10)
      },
      { timeout: 5000 }
    )
  },
}

export const LiveAPI: Story = {
  render: () => <LiveAPIWrapper />,
}
