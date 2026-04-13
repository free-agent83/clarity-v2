import type { Meta, StoryObj } from "@storybook/react"
import { Item } from "./item"

const meta: Meta<typeof Item> = {
  title: "Layout/Item",
  component: Item,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Item>

export const Default: Story = {
  args: {
    children: "List item content",
  },
}
