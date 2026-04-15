import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";
import { Input } from "../input/input";

const meta: Meta<typeof Label> = {
  title: "Forms/Label",
  component: Label,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: { htmlFor: "email", children: "Email address" },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <Label {...args} />
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
};
