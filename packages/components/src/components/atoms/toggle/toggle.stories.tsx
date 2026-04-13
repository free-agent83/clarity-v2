import type { Meta, StoryObj } from "@storybook/react"
import { Toggle } from "./toggle"

const meta: Meta<typeof Toggle> = {
  title: "Forms/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
  },
}

export default meta
type Story = StoryObj<typeof Toggle>

export const Default: Story = {
  args: { children: "Toggle" },
}
