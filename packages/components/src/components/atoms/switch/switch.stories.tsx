import type { Meta, StoryObj } from "@storybook/react"
import { Switch } from "./switch"

const meta: Meta<typeof Switch> = {
  title: "Forms/Switch",
  component: Switch,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {}
