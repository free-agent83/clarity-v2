import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { AllFiltersButton } from "./all-filters-button";

const meta: Meta<typeof AllFiltersButton> = {
  title: "Filtering/AllFiltersButton",
  component: AllFiltersButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AllFiltersButton>;

export const Inactive: Story = {
  args: { activeFilterCount: 0, onClick: fn() },
};

export const Active: Story = {
  args: { activeFilterCount: 3, onClick: fn() },
};
