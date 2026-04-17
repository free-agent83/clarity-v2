import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within, expect } from "@storybook/test";
import { Slider } from "./slider";

const meta: Meta<typeof Slider> = {
  title: "Forms/Slider",
  component: Slider,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    disabled: { control: "boolean" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: { defaultValue: [33], min: 0, max: 100, step: 1 },
  render: (args) => <Slider {...args} className="w-64" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const thumb = canvas.getByRole("slider");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "35");
  },
};

export const Range: Story = {
  args: { defaultValue: [20, 80], min: 0, max: 100, step: 1 },
  render: (args) => <Slider {...args} className="w-64" />,
};

export const Snapping: Story = {
  render: () => {
    const [value, setValue] = React.useState([50]);
    return (
      <div className="flex w-64 flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Quantity</span>
          <span className="text-sm font-medium tabular-nums">{value[0]}</span>
        </div>
        <Slider
          value={value}
          onValueChange={setValue}
          min={0}
          max={100}
          step={25}
        />
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const thumb = canvas.getByRole("slider");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "75");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "25");
  },
};

export const Vertical: Story = {
  args: { defaultValue: [50], orientation: "vertical" },
  render: (args) => (
    <div className="h-48">
      <Slider {...args} />
    </div>
  ),
};
