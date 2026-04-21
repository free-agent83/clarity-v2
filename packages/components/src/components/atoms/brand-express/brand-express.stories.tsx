import type { Meta, StoryObj } from "@storybook/react";

import { BrandExpress } from "./brand-express";

const meta: Meta<typeof BrandExpress> = {
  title: "Foundations/Brand Express",
  component: BrandExpress,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BrandExpress>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <BrandExpress className="h-4" />
      <BrandExpress className="h-5" />
      <BrandExpress className="h-6" />
      <BrandExpress className="h-10" />
      <BrandExpress className="h-16" />
    </div>
  ),
};

export const OnDark: Story = {
  render: () => (
    <div className="flex items-center justify-center rounded-md bg-foreground p-10">
      <BrandExpress className="h-16" />
    </div>
  ),
};
