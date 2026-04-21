import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  MultiSelectChipsFilter,
  type MultiSelectChipOption,
  type MultiSelectChipsValue,
} from "./multi-select-chips";

const meta: Meta<typeof MultiSelectChipsFilter> = {
  title: "Templates/PLP/Filters/MultiSelectChips",
  component: MultiSelectChipsFilter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MultiSelectChipsFilter>;

const COLOR_OPTIONS: MultiSelectChipOption[] = [
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
  { value: "teal", label: "Teal" },
  { value: "pink", label: "Pink" },
  { value: "yellow", label: "Yellow" },
];

const SHAPE_OPTIONS: MultiSelectChipOption[] = [
  { value: "round", label: "Round" },
  { value: "oval", label: "Oval" },
  { value: "cushion", label: "Cushion" },
  { value: "princess", label: "Princess" },
];

function Controlled({
  options,
  initial,
}: {
  options: MultiSelectChipOption[];
  initial?: MultiSelectChipsValue;
}) {
  const [value, setValue] = useState<MultiSelectChipsValue>(initial);
  return (
    <MultiSelectChipsFilter
      value={value}
      onChange={setValue}
      options={options}
    />
  );
}

export const Default: Story = {
  render: () => <Controlled options={COLOR_OPTIONS} />,
};

export const WithSelection: Story = {
  render: () => <Controlled options={COLOR_OPTIONS} initial={["blue", "green"]} />,
};

export const RichRenderOption: Story = {
  render: () => {
    const options: MultiSelectChipOption[] = SHAPE_OPTIONS.map((o) => ({
      ...o,
      renderOption: ({ selected }) => (
        <div className="flex flex-col items-center gap-1 px-2 py-1">
          <span
            aria-hidden
            className={`text-lg ${selected ? "opacity-100" : "opacity-60"}`}
          >
            ◆
          </span>
          <span className="text-xs">{o.label}</span>
        </div>
      ),
    }));
    const [value, setValue] = useState<MultiSelectChipsValue>(undefined);
    return (
      <MultiSelectChipsFilter
        value={value}
        onChange={setValue}
        options={options}
      />
    );
  },
};
