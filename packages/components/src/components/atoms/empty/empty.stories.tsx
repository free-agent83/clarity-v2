import type { Meta, StoryObj } from "@storybook/react"
import { Empty } from "./empty"

const meta: Meta<typeof Empty> = {
  title: "Feedback/Empty",
  component: Empty,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Empty>

export const Default: Story = {}

export const CustomContent: Story = {
  render: () => (
    <Empty>
      <p className="text-sm text-muted-foreground">
        No results found. Try adjusting your filters.
      </p>
    </Empty>
  ),
}
