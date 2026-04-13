import type { Meta, StoryObj } from "@storybook/react"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "./hover-card"

const meta: Meta<typeof HoverCard> = {
  title: "Overlays/Hover Card",
  component: HoverCard,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof HoverCard>

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger>Hover me</HoverCardTrigger>
      <HoverCardContent>
        <p>Hover card content goes here.</p>
      </HoverCardContent>
    </HoverCard>
  ),
}
