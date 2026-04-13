import type { Meta, StoryObj } from "@storybook/react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "./popover"

const meta: Meta<typeof Popover> = {
  title: "Overlays/Popover",
  component: Popover,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Popover>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverContent>
        <p>Popover content goes here.</p>
      </PopoverContent>
    </Popover>
  ),
}
