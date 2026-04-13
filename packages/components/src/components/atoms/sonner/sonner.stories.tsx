import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "sonner";
import { Toaster } from "./sonner";
import { Button } from "../button/button";

const meta: Meta<typeof Toaster> = {
  title: "Feedback/Sonner",
  component: Toaster,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <div>
      <Button onClick={() => toast("Placeholder toast")}>Show toast</Button>
      <Toaster />
    </div>
  ),
};
