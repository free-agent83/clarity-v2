import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within, expect } from "@storybook/test";
import { Textarea } from "./textarea";
import { Label } from "../label/label";

const meta: Meta<typeof Textarea> = {
  title: "Forms/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    rows: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: { placeholder: "Tell us what you think..." },
  render: (args) => <Textarea {...args} className="w-64" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText(
      "Tell us what you think..."
    ) as HTMLTextAreaElement;
    await userEvent.click(textarea);
    await userEvent.type(textarea, "Hello world");
    await expect(textarea).toHaveValue("Hello world");
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="feedback">Feedback</Label>
      <Textarea id="feedback" placeholder="Tell us what you think..." />
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="invalid">Feedback</Label>
      <Textarea id="invalid" aria-invalid defaultValue="" />
    </div>
  ),
};
