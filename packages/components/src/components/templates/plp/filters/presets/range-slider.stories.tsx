import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  RangeSliderFilter,
  type RangeSliderHistogram,
  type RangeSliderValue,
} from "./range-slider";
import { buildMockHistogram } from "../../mocks/common";

const meta: Meta<typeof RangeSliderFilter> = {
  title: "Templates/PLP/Filters/RangeSlider",
  component: RangeSliderFilter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RangeSliderFilter>;

const PRICE_HISTOGRAM: RangeSliderHistogram = buildMockHistogram(
  0,
  10000,
  40,
  2500
);

function Controlled({
  initial,
  min = 0,
  max = 10000,
  step = 10,
  unit = "$",
  histogram,
}: {
  initial?: RangeSliderValue;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  histogram?: RangeSliderHistogram;
}) {
  const [value, setValue] = useState<RangeSliderValue>(initial);
  return (
    <div className="w-80">
      <RangeSliderFilter
        value={value}
        onChange={setValue}
        min={min}
        max={max}
        step={step}
        unit={unit}
        histogram={histogram}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithSelection: Story = {
  render: () => <Controlled initial={{ min: 1000, max: 5000 }} />,
};

export const WithHistogram: Story = {
  render: () => <Controlled histogram={PRICE_HISTOGRAM} />,
};

export const SuffixUnit: Story = {
  render: () => (
    <Controlled min={0} max={10} step={0.1} unit="ct" />
  ),
};
