import type { Meta, StoryObj } from "@storybook/react";

import { Brand } from "./brand";

const meta: Meta<typeof Brand> = {
  title: "Foundations/Brand",
  component: Brand,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Brand>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <Brand className="h-4" />
      <Brand className="h-6" />
      <Brand className="h-10" />
      <Brand className="h-16" />
      <Brand className="h-24" />
    </div>
  ),
};

export const OnDark: Story = {
  render: () => (
    <div className="flex items-center justify-center rounded-md bg-foreground p-10 text-background">
      <Brand className="h-16" />
    </div>
  ),
};

export const Recoloured: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <Brand className="h-12 text-primary" />
      <Brand className="h-12 text-destructive" />
      <Brand className="h-12 text-muted-foreground" />
    </div>
  ),
};
