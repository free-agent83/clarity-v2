import type { Meta, StoryObj } from "@storybook/react";
import { IconCheck } from "@tabler/icons-react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "Display/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "success",
        "warning",
        "info",
        "outline",
        "ghost",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: "Badge", variant: "default" },
};

export const WithIcon: Story = {
  args: { variant: "success" },
  render: (args) => (
    <Badge {...args}>
      <IconCheck />
      Verified
    </Badge>
  ),
};
