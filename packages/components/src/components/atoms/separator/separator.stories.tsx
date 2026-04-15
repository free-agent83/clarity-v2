import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./separator";

const meta: Meta<typeof Separator> = {
  title: "Display/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    decorative: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  args: { orientation: "horizontal" },
  render: (args) => (
    <div className="w-64">
      <div className="text-sm text-muted-foreground">Above</div>
      <Separator {...args} className="my-2" />
      <div className="text-sm text-muted-foreground">Below</div>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex h-16 items-center gap-4">
      <div className="text-sm text-muted-foreground">Left</div>
      <Separator {...args} />
      <div className="text-sm text-muted-foreground">Right</div>
    </div>
  ),
};
