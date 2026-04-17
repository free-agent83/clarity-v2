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
    onApply: fn(),
    onClear: fn(),
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

const SampleControl = () => (
  <div className="text-sm text-muted-foreground">
    (The consumer's filter control renders here — chips, sliders, combobox,
    etc. FilterButton renders Apply and Clear below automatically.)
  </div>
);

export const Inactive: Story = {
  args: {
    label: "Color",
    children: <SampleControl />,
  },
};

export const Active: Story = {
  args: {
    label: "Color",
    valueSummary: "Blue, Green +3 more",
    children: <SampleControl />,
  },
};

export const ActiveSingleValue: Story = {
  args: {
    label: "Location",
    valueSummary: "Europe",
    children: <SampleControl />,
  },
};

export const ActiveLongValue: Story = {
  args: {
    label: "Supplier",
    valueSummary: "Acme Gem Traders, Globex Mining Co. +8 more",
    children: <SampleControl />,
  },
};

export const WithWidePopover: Story = {
  args: {
    label: "Carat",
    valueSummary: "1.00–3.50ct",
    popoverWidth: 360,
    children: (
      <div className="text-sm text-muted-foreground">
        (A wider popover, useful for range sliders or rich controls that
        need more horizontal room. Apply / Clear still sit below.)
      </div>
    ),
  },
};
