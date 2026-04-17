import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { FilterButton } from "./filter-button";

const meta: Meta<typeof FilterButton> = {
  title: "Actions/Filter Button",
  component: FilterButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    onDismiss: fn(),
    onOpenChange: fn(),
  },
  argTypes: {
    label: { control: "text" },
    valueSummary: { control: "text" },
    popoverWidth: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof FilterButton>;

export const Inactive: Story = {
  args: {
    label: "Color",
    popoverContent: (
      <div className="text-sm text-muted-foreground">
        (Filter control renders here — chips, sliders, combobox, etc.)
      </div>
    ),
  },
};

export const Active: Story = {
  args: {
    label: "Color",
    valueSummary: "Blue, Green +3 more",
    popoverContent: (
      <div className="text-sm text-muted-foreground">
        (Filter control renders here, pre-populated with the current value.)
      </div>
    ),
  },
};

export const ActiveSingleValue: Story = {
  args: {
    label: "Location",
    valueSummary: "Europe",
    popoverContent: (
      <div className="text-sm text-muted-foreground">
        (Filter control renders here.)
      </div>
    ),
  },
};

export const ActiveLongValue: Story = {
  args: {
    label: "Supplier",
    valueSummary: "Acme Gem Traders, Globex Mining Co. +8 more",
    popoverContent: (
      <div className="text-sm text-muted-foreground">
        (Filter control renders here.)
      </div>
    ),
  },
};

export const WithWidePopover: Story = {
  args: {
    label: "Carat",
    valueSummary: "1.00–3.50ct",
    popoverWidth: 360,
    popoverContent: (
      <div className="text-sm text-muted-foreground">
        (A wider popover, useful for range sliders or rich controls that
        need more horizontal room.)
      </div>
    ),
  },
};
