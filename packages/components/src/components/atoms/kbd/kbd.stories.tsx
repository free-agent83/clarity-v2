import type { Meta, StoryObj } from "@storybook/react"
import { Kbd } from "./kbd"

const meta: Meta<typeof Kbd> = {
  title: "Display/Kbd",
  component: Kbd,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Kbd>

export const Default: Story = {
  args: { children: "K" },
}

export const Shortcut: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <Kbd>Ctrl</Kbd>
      <span className="text-xs text-muted-foreground">+</span>
      <Kbd>K</Kbd>
    </div>
  ),
}
