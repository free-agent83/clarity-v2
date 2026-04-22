import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react";
import { IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";
import { SegmentedControl, SegmentedControlItem } from "./segmented-control";

const meta: Meta<typeof SegmentedControl> = {
  title: "Forms/Segmented Control",
  component: SegmentedControl,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
  },
  args: {
    defaultValue: "list",
    size: "default",
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  render: (args) => (
    <SegmentedControl {...args}>
      <SegmentedControlItem value="list">List</SegmentedControlItem>
      <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <SegmentedControl {...args}>
      <SegmentedControlItem value="list">
        <IconLayoutList />
        List
      </SegmentedControlItem>
      <SegmentedControlItem value="grid">
        <IconLayoutGrid />
        Grid
      </SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const IconOnly: Story = {
  render: (args) => (
    <SegmentedControl {...args}>
      <SegmentedControlItem value="list" aria-label="List view">
        <IconLayoutList />
      </SegmentedControlItem>
      <SegmentedControlItem value="grid" aria-label="Grid view">
        <IconLayoutGrid />
      </SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <SegmentedControl {...args} size="sm">
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl {...args} size="default">
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl {...args} size="lg">
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
      </SegmentedControl>
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [value, setValue] = React.useState("list");
    return (
      <div className="flex flex-col items-start gap-3">
        <SegmentedControl {...args} value={value} onValueChange={setValue}>
          <SegmentedControlItem value="list">List</SegmentedControlItem>
          <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
          <SegmentedControlItem value="map">Map</SegmentedControlItem>
        </SegmentedControl>
        <span className="text-sm text-muted-foreground">
          Selected: <code>{value}</code>
        </span>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: (args) => (
    <SegmentedControl {...args}>
      <SegmentedControlItem value="list">List</SegmentedControlItem>
      <SegmentedControlItem value="grid" disabled>
        Grid
      </SegmentedControlItem>
      <SegmentedControlItem value="map">Map</SegmentedControlItem>
    </SegmentedControl>
  ),
};
