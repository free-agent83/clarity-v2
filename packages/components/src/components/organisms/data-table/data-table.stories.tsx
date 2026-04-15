import type { Meta, StoryObj } from "@storybook/react"
import { userEvent, within, expect, waitFor } from "@storybook/test"
import { DataTable } from "./data-table"
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
    cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
  },
]

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
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click the first data row checkbox ([0] is the header checkbox)
    const checkboxes = canvas.getAllByRole("checkbox")
    await userEvent.click(checkboxes[1])

    // Verify selection bar appears
    const selectionText = canvas.getByText(/1 row\(s\) selected/)
    await expect(selectionText).toBeInTheDocument()

    // Verify clear selection button exists
    const clearButton = canvas.getByRole("button", { name: /Clear selection/ })
    await expect(clearButton).toBeInTheDocument()
  },
}

export const WithSelectionActions: Story = {
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

export const WithToolbar: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
      toolbar: {
        search: {
          placeholder: "Search products...",
          columnIds: ["name", "category"],
        },
        sorting: [
          { label: "Price, high to low", columnId: "price", direction: "desc" },
          { label: "Price, low to high", columnId: "price", direction: "asc" },
        ],
      },
    },
  },
}

export const WithCheckboxFilter: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
      toolbar: {
        quickFilters: [
          { name: "Category", columnId: "category", type: "checkbox-list" },
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // Open the Category filter popover
    const trigger = canvas.getByRole("button", { name: "Category" })
    await userEvent.click(trigger)

    // Check two options
    const ringsCb = body.getByRole("checkbox", { name: "Rings" })
    const necklacesCb = body.getByRole("checkbox", { name: "Necklaces" })
    await userEvent.click(ringsCb)
    await userEvent.click(necklacesCb)

    // Apply
    const applyBtn = body.getByRole("button", { name: "Apply" })
    await userEvent.click(applyBtn)

    // Verify trigger label shows count
    await waitFor(() => {
      expect(
        canvas.getByRole("button", { name: /Category \(2\)/ })
      ).toBeInTheDocument()
    })

    // Verify filtered rows contain only Rings or Necklaces
    await waitFor(() => {
      const rows = canvasElement.querySelectorAll("tbody tr")
      for (const row of rows) {
        const text = row.textContent ?? ""
        expect(text).toMatch(/Rings|Necklaces/)
      }
    })

    // Reopen popover and Clear
    await userEvent.click(
      canvas.getByRole("button", { name: /Category \(2\)/ })
    )
    const clearBtn = body.getByRole("button", { name: "Clear" })
    await userEvent.click(clearBtn)

    // Verify trigger label resets and all rows restored
    await waitFor(() => {
      expect(
        canvas.getByRole("button", { name: "Category" })
      ).toBeInTheDocument()
      const rows = canvasElement.querySelectorAll("tbody tr")
      expect(rows.length).toBe(10)
    })
  },
}

export const WithSliderFilter: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
      toolbar: {
        quickFilters: [
          {
            name: "Price",
            columnId: "price",
            type: "interval-slider",
            formatValue: (v: number) => `$${v.toFixed(0)}`,
          },
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // Verify the Price filter trigger renders
    const trigger = canvas.getByRole("button", { name: "Price" })
    await expect(trigger).toBeInTheDocument()

    // Open the popover and verify slider renders
    await userEvent.click(trigger)

    await waitFor(() => {
      const sliders = body.getAllByRole("slider")
      expect(sliders.length).toBe(2) // dual thumbs
    })

    // Apply with default full range
    const applyBtn = body.getByRole("button", { name: "Apply" })
    await userEvent.click(applyBtn)

    // Verify trigger label shows the formatted range
    await waitFor(() => {
      expect(
        canvas.getByRole("button", { name: /Price: \$/ })
      ).toBeInTheDocument()
    })
  },
}

export const WithQuickFilters: Story = {
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
}

export const WithClearAll: Story = {
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
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // Apply a checkbox filter
    const trigger = canvas.getByRole("button", { name: "Category" })
    await userEvent.click(trigger)

    const ringsCb = body.getByRole("checkbox", { name: "Rings" })
    await userEvent.click(ringsCb)

    const applyBtn = body.getByRole("button", { name: "Apply" })
    await userEvent.click(applyBtn)

    // Verify "Clear all" appears
    await waitFor(() => {
      expect(
        canvas.getByRole("button", { name: "Clear all" })
      ).toBeInTheDocument()
    })

    // Click "Clear all"
    await userEvent.click(
      canvas.getByRole("button", { name: "Clear all" })
    )

    // Verify filter is reset
    await waitFor(() => {
      expect(
        canvas.getByRole("button", { name: "Category" })
      ).toBeInTheDocument()
    })

    // Verify "Clear all" disappears
    await waitFor(() => {
      expect(
        canvas.queryByRole("button", { name: "Clear all" })
      ).not.toBeInTheDocument()
    })

    // Verify all rows restored
    await waitFor(() => {
      const rows = canvasElement.querySelectorAll("tbody tr")
      expect(rows.length).toBe(10)
    })
  },
}
