import type { Meta, StoryObj } from "@storybook/react"
import { Spinner } from "./spinner"

const meta: Meta<typeof Spinner> = {
  title: "Feedback/Spinner",
  component: Spinner,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Spinner>

export const Default: Story = {}

export const Large: Story = {
  args: { className: "size-8" },
}

export const Small: Story = {
  args: { className: "size-3" },
}
