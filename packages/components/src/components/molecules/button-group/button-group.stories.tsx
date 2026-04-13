import type { Meta, StoryObj } from "@storybook/react"
import { ButtonGroup } from "./button-group"
import { Button } from "../../atoms/button/button"

const meta: Meta<typeof ButtonGroup> = {
  title: "Actions/Button Group",
  component: ButtonGroup,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof ButtonGroup>

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outlined">Left</Button>
      <Button variant="outlined">Center</Button>
      <Button variant="outlined">Right</Button>
    </ButtonGroup>
  ),
}
