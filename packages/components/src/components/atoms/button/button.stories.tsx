import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["contained", "secondary", "outlined", "text", "link"],
    },
    intent: {
      control: "select",
      options: ["primary", "success", "error"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Contained: Story = {
  args: { children: "Button", variant: "contained" },
};

export const Secondary: Story = {
  args: { children: "Secondary", variant: "secondary" },
};

export const Outlined: Story = {
  args: { children: "Outlined", variant: "outlined" },
};

export const Text: Story = {
  args: { children: "Text button", variant: "text" },
};

export const Link: Story = {
  args: { children: "Link", variant: "link" },
};

export const ContainedSuccess: Story = {
  args: { children: "Confirm", variant: "contained", intent: "success" },
};

export const OutlinedSuccess: Story = {
  args: { children: "Approve", variant: "outlined", intent: "success" },
};

export const TextSuccess: Story = {
  args: { children: "Done", variant: "text", intent: "success" },
};

export const ContainedError: Story = {
  args: { children: "Delete", variant: "contained", intent: "error" },
};

export const OutlinedError: Story = {
  args: { children: "Remove", variant: "outlined", intent: "error" },
};

export const TextError: Story = {
  args: { children: "Cancel", variant: "text", intent: "error" },
};

export const Small: Story = {
  args: { children: "Small", size: "sm" },
};

export const Large: Story = {
  args: { children: "Large", size: "lg" },
};

export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
};

export const DisabledOutlined: Story = {
  args: { children: "Disabled", variant: "outlined", disabled: true },
};
