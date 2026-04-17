import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within, expect } from "@storybook/test";
import { Checkbox } from "./checkbox";
import { Label } from "../label/label";

const meta: Meta<typeof Checkbox> = {
  title: "Forms/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="default" {...args} />
      <Label htmlFor="default">Accept terms and conditions</Label>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");
    await expect(checkbox).toHaveAttribute("data-state", "unchecked");
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute("data-state", "checked");
  },
};

export const Group: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="email-marketing" defaultChecked />
        <Label htmlFor="email-marketing">Marketing emails</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="email-product" defaultChecked />
        <Label htmlFor="email-product">Product updates</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="email-security" />
        <Label htmlFor="email-security">Security alerts</Label>
      </div>
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="invalid" aria-invalid />
      <Label htmlFor="invalid">Accept terms and conditions</Label>
    </div>
  ),
};
