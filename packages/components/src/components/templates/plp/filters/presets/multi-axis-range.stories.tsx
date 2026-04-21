import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  MultiAxisRangeFilter,
  type MultiAxisRangeAxis,
  type MultiAxisRangeValue,
} from "./multi-axis-range";

const meta: Meta<typeof MultiAxisRangeFilter> = {
  title: "Templates/PLP/Filters/MultiAxisRange",
  component: MultiAxisRangeFilter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MultiAxisRangeFilter>;

const SIZE_AXES: MultiAxisRangeAxis[] = [
  { id: "length", label: "Length", min: 0, max: 20, step: 0.1, unit: "mm" },
  { id: "width", label: "Width", min: 0, max: 20, step: 0.1, unit: "mm" },
  { id: "depth", label: "Depth", min: 0, max: 10, step: 0.1, unit: "mm" },
];

function Controlled({
  initial,
}: {
  initial?: MultiAxisRangeValue;
}) {
  const [value, setValue] = useState<MultiAxisRangeValue>(initial);
  return (
    <div className="w-80">
      <MultiAxisRangeFilter value={value} onChange={setValue} axes={SIZE_AXES} />
    </div>
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const PartialEngagement: Story = {
  render: () => (
    <Controlled
      initial={{
        length: { min: 5, max: 10 },
        width: { min: 3, max: 7 },
      }}
    />
  ),
};

export const AllAxesEngaged: Story = {
  render: () => (
    <Controlled
      initial={{
        length: { min: 4, max: 8 },
        width: { min: 4, max: 8 },
        depth: { min: 2, max: 4 },
      }}
    />
  ),
};
