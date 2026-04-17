import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within, expect } from "@storybook/test";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "../label/label";

const meta: Meta<typeof RadioGroup> = {
  title: "Forms/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["vertical", "horizontal"],
    },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup defaultValue="standard" {...args}>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="standard" id="standard" />
        <Label htmlFor="standard">Standard delivery</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="express" id="express" />
        <Label htmlFor="express">Express delivery</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="pickup" id="pickup" />
        <Label htmlFor="pickup">Pickup in store</Label>
      </div>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const express = canvas.getByRole("radio", { name: "Express delivery" });
    await userEvent.click(express);
    await expect(express).toHaveAttribute("data-state", "checked");
  },
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="sm" orientation="horizontal" className="flex gap-4">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="sm" id="size-sm" />
        <Label htmlFor="size-sm">Small</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="md" id="size-md" />
        <Label htmlFor="size-md">Medium</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="lg" id="size-lg" />
        <Label htmlFor="size-lg">Large</Label>
      </div>
    </RadioGroup>
  ),
};
