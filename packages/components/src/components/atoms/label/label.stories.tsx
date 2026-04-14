import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";

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
      <input
        id="email"
        type="email"
        className="rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
    </div>
  ),
};
