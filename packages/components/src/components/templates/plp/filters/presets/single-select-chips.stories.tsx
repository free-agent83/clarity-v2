import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  SingleSelectChipsFilter,
  type SingleSelectChipOption,
  type SingleSelectChipsValue,
} from "./single-select-chips";

const meta: Meta<typeof SingleSelectChipsFilter> = {
  title: "Templates/PLP/Filters/SingleSelectChips",
  component: SingleSelectChipsFilter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SingleSelectChipsFilter>;

const TREATMENT_OPTIONS: SingleSelectChipOption[] = [
  { value: "none", label: "None" },
  { value: "heated", label: "Heated" },
  { value: "oiled", label: "Oiled" },
];

const COLOR_OPTIONS: SingleSelectChipOption[] = [
  {
    value: "blue",
    label: "Blue",
    adornment: (
      <span
        aria-hidden
        className="inline-block h-3 w-3 rounded-full bg-blue-500"
      />
    ),
  },
  {
    value: "green",
    label: "Green",
    adornment: (
      <span
        aria-hidden
        className="inline-block h-3 w-3 rounded-full bg-green-500"
      />
    ),
  },
  {
    value: "red",
    label: "Red",
    adornment: (
      <span
        aria-hidden
        className="inline-block h-3 w-3 rounded-full bg-red-500"
      />
    ),
  },
];

function Controlled({
  options,
  initial,
}: {
  options: SingleSelectChipOption[];
  initial?: SingleSelectChipsValue;
}) {
  const [value, setValue] = useState<SingleSelectChipsValue>(initial);
  return (
    <SingleSelectChipsFilter
      value={value}
      onChange={setValue}
      options={options}
    />
  );
}

export const Default: Story = {
  render: () => <Controlled options={TREATMENT_OPTIONS} />,
};

export const WithSelection: Story = {
  render: () => <Controlled options={TREATMENT_OPTIONS} initial="heated" />,
};

export const WithAdornments: Story = {
  render: () => <Controlled options={COLOR_OPTIONS} />,
};
