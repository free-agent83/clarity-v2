import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "./toggle";

const meta: Meta<typeof Toggle> = {
  title: "Forms/Toggle",
  component: Toggle,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  render: () => <Toggle variant="outline">Toggle</Toggle>,
};
