import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within, expect } from "@storybook/test";
import { Switch } from "./switch";
import { Label } from "../label/label";

const meta: Meta<typeof Switch> = {
  title: "Forms/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
    },
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch id="default" {...args} />
      <Label htmlFor="default">Airplane mode</Label>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch");
    await expect(toggle).toHaveAttribute("data-state", "unchecked");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("data-state", "checked");
  },
};

export const SettingsRow: Story = {
  render: () => (
    <div className="flex w-80 items-center justify-between">
      <div className="flex flex-col">
        <Label htmlFor="notifications">Push notifications</Label>
        <span className="text-sm text-muted-foreground">
          Send a notification when there is activity on your account.
        </span>
      </div>
      <Switch id="notifications" defaultChecked />
    </div>
  ),
};
