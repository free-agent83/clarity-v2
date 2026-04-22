import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./progress";

const meta: Meta<typeof Progress> = {
  title: "Feedback/Progress",
  component: Progress,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "info", "warning", "destructive"],
    },
    size: {
      control: "select",
      options: ["default", "lg"],
    },
  },
  args: {
    value: 60,
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: (args) => <Progress {...args} className="w-64" />,
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex w-64 flex-col gap-4">
      <Progress {...args} variant="default" />
      <Progress {...args} variant="success" />
      <Progress {...args} variant="info" />
      <Progress {...args} variant="warning" />
      <Progress {...args} variant="destructive" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-64 flex-col gap-4">
      <Progress {...args} size="default" />
      <Progress {...args} size="lg" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex w-64 flex-col gap-2">
      <div className="flex justify-between text-sm">
        <span className="text-foreground">Uploading</span>
        <span className="text-muted-foreground">{args.value}%</span>
      </div>
      <Progress {...args} />
    </div>
  ),
};
