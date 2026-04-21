import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  SingleSelectDropdownFilter,
  type SingleSelectDropdownOption,
  type SingleSelectDropdownValue,
} from "./single-select-dropdown";

const meta: Meta<typeof SingleSelectDropdownFilter> = {
  title: "Templates/PLP/Filters/SingleSelectDropdown",
  component: SingleSelectDropdownFilter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SingleSelectDropdownFilter>;

const LOCATION_OPTIONS: SingleSelectDropdownOption[] = [
  { value: "us", label: "United States" },
  { value: "eu", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "africa", label: "Africa" },
  { value: "oceania", label: "Oceania" },
];

function Controlled({
  initial,
}: {
  initial?: SingleSelectDropdownValue;
}) {
  const [value, setValue] = useState<SingleSelectDropdownValue>(initial);
  return (
    <div className="w-64">
      <SingleSelectDropdownFilter
        value={value}
        onChange={setValue}
        options={LOCATION_OPTIONS}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithSelection: Story = {
  render: () => <Controlled initial="eu" />,
};
