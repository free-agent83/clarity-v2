import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "./sonner";

const meta: Meta<typeof Toaster> = {
  title: "Feedback/Sonner",
  component: Toaster,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {};
