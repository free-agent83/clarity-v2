import type { Meta, StoryObj } from "@storybook/react";
import { Collapsible } from "./collapsible";

const meta: Meta<typeof Collapsible> = {
  title: "Display/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {};
