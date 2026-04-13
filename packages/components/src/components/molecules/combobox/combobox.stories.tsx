import type { Meta, StoryObj } from "@storybook/react"
import { Combobox } from "./combobox"

const meta: Meta<typeof Combobox> = {
  title: "Forms/Combobox",
  component: Combobox,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Combobox>

export const Default: Story = {}
