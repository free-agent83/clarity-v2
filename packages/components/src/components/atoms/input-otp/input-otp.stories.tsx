import type { Meta, StoryObj } from "@storybook/react";
import { InputOTP } from "./input-otp";

const meta: Meta<typeof InputOTP> = {
  title: "Forms/InputOTP",
  component: InputOTP,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InputOTP>;

export const Default: Story = {};
