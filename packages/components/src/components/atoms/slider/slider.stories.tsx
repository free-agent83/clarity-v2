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

export const Vertical: Story = {
  args: { defaultValue: [50], orientation: "vertical" },
  render: (args) => (
    <div className="h-48">
      <Slider {...args} />
    </div>
  ),
};
