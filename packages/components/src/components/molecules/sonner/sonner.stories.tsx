import type { Meta, StoryObj } from "@storybook/react"
import { Toaster } from "./sonner"
import { toast } from "sonner"

const meta: Meta<typeof Toaster> = {
  title: "Feedback/Sonner",
  component: Toaster,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Toaster>

export const Default: Story = {
  render: () => (
    <div>
      <Toaster />
      <button onClick={() => toast("Hello from Sonner!")}>Show toast</button>
    </div>
  ),
}
