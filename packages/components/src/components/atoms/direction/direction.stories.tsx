import type { Meta, StoryObj } from "@storybook/react";
import { DirectionProvider } from "./direction";

const meta: Meta<typeof DirectionProvider> = {
  title: "Foundations/Direction",
  component: DirectionProvider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DirectionProvider>;

export const Default: Story = {};
