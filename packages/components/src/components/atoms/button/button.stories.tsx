import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { IconPlusFilled } from "@tabler/icons-react";

const meta: Meta<typeof Button> = {
  title: "Actions/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Select center stone",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "outline",
        "secondary",
        "ghost",
        "destructive",
        "success",
        "link",
      ],
    },
    size: {
      control: "select",
      options: [
        "default",
        "sm",
        "lg",
        "icon",
        "icon-xs",
        "icon-sm",
      ],
    },
    block: { control: "boolean" },
    asChild: { control: "boolean" },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { variant: "default" },
};

export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      Add center stone
      <IconPlusFilled />
    </Button>
  ),
};

export const IconButton: Story = {
  args: { size: "icon" },
  render: (args) => (
    <Button {...args}>
      <IconPlusFilled />
    </Button>
  ),
};

export const Block: Story = {
  args: { block: true },
  render: (args) => (
    <div className="w-100">
      <Button {...args} />
    </div>
  ),
};

export const AsChild: Story = {
  args: { asChild: true },
  render: (args) => (
    <Button {...args}>
      <a href="#">Link as button</a>
    </Button>
  ),
};

export const Loading: Story = {
  args: { loading: true },
};
