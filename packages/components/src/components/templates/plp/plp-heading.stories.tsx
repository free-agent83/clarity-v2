import type { Meta, StoryObj } from "@storybook/react";
import { PlpHeading } from "./plp-heading";

const meta: Meta<typeof PlpHeading> = {
  title: "Templates/PLP/Heading",
  component: PlpHeading,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PlpHeading>;

export const Default: Story = {
  args: {
    breadcrumbs: [{ label: "Gemstones", href: "#" }, { label: "Sapphire" }],
    title: "Sapphire",
    resultsCount: 1234567,
  },
};

export const NoBreadcrumbs: Story = {
  args: {
    breadcrumbs: [],
    title: "Search results",
    resultsCount: 42,
  },
};

export const DeepBreadcrumbs: Story = {
  args: {
    breadcrumbs: [
      { label: "Jewelry", href: "#" },
      { label: "Rings", href: "#" },
      { label: "Wedding", href: "#" },
      { label: "Three-stone" },
    ],
    title: "Three-stone wedding rings",
    resultsCount: 289,
  },
};
