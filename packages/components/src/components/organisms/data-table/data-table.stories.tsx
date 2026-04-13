import type { Meta, StoryObj } from "@storybook/react"
import { DataTable } from "./data-table"

const meta: Meta<typeof DataTable> = {
  title: "Data/Data Table",
  component: DataTable,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof DataTable>

export const Default: Story = {
  render: () => <DataTable />,
}

export const WithChildren: Story = {
  render: () => (
    <DataTable>
      <p className="text-sm p-4">
        Custom content passed as children. The full DataTable implementation
        will use @tanstack/react-table for sorting, filtering, pagination,
        and row selection.
      </p>
    </DataTable>
  ),
}
