import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  RangeFilter,
  type RangeAxis,
  type RangeHistogram,
  type RangeValue,
} from "./range-filter";
import { buildMockHistogram } from "../../templates/plp/mocks/common";

const meta: Meta<typeof RangeFilter> = {
  title: "Filtering/RangeFilter",
  component: RangeFilter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RangeFilter>;

const PRICE_HISTOGRAM: RangeHistogram = buildMockHistogram(0, 10000, 40, 2500);

const PRICE_AXIS: RangeAxis = {
  id: "price",
  min: 0,
  max: 10000,
  step: 10,
  unit: "$",
  histogram: PRICE_HISTOGRAM,
};

const CARAT_AXIS: RangeAxis = {
  id: "carat",
  min: 0,
  max: 10,
  step: 0.1,
  unit: "ct",
};

const SIZE_AXES: RangeAxis[] = [
  { id: "length", label: "Length", min: 0, max: 20, step: 0.1, unit: "mm" },
  { id: "width", label: "Width", min: 0, max: 20, step: 0.1, unit: "mm" },
  { id: "depth", label: "Depth", min: 0, max: 10, step: 0.1, unit: "mm" },
];

function Controlled({
  axes,
  initial,
}: {
  axes: RangeAxis[];
  initial?: RangeValue;
}) {
  const [value, setValue] = useState<RangeValue>(initial);
  return (
    <div className="w-80">
      <RangeFilter value={value} onChange={setValue} axes={axes} />
    </div>
  );
}

export const SingleAxis: Story = {
  render: () => <Controlled axes={[PRICE_AXIS]} />,
};

export const SingleAxisEngaged: Story = {
  render: () => (
    <Controlled axes={[PRICE_AXIS]} initial={{ price: { min: 1000, max: 5000 } }} />
  ),
};

export const SingleAxisSuffixUnit: Story = {
  render: () => <Controlled axes={[CARAT_AXIS]} />,
};

export const MultiAxis: Story = {
  render: () => <Controlled axes={SIZE_AXES} />,
};

export const MultiAxisPartiallyEngaged: Story = {
  render: () => (
    <Controlled
      axes={SIZE_AXES}
      initial={{ length: { min: 5, max: 10 }, width: { min: 3, max: 7 } }}
    />
  ),
};
