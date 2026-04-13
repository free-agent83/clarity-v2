import type { Meta, StoryObj } from "@storybook/react"
import { InputGroup } from "./input-group"

const meta: Meta<typeof InputGroup> = {
  title: "Forms/Input Group",
  component: InputGroup,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof InputGroup>

export const Default: Story = {
  args: { children: "Input Group placeholder" },
}
