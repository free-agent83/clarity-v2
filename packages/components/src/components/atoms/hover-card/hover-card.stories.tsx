import type { Meta, StoryObj } from "@storybook/react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card";

const meta: Meta<typeof HoverCard> = {
  title: "Overlays/HoverCard",
  component: HoverCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => (
    <HoverCard defaultOpen>
      <HoverCardTrigger>Trigger</HoverCardTrigger>
      <HoverCardContent>Content</HoverCardContent>
    </HoverCard>
  ),
};
