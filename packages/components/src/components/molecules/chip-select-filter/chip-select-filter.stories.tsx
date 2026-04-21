import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  ChipSelectFilter,
  type ChipSelectOption,
} from "./chip-select-filter";

const meta: Meta<typeof ChipSelectFilter> = {
  title: "Filtering/ChipSelectFilter",
  component: ChipSelectFilter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChipSelectFilter>;

const COLORS: ChipSelectOption[] = [
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
  { value: "teal", label: "Teal" },
  { value: "pink", label: "Pink" },
  { value: "yellow", label: "Yellow" },
];

const TREATMENTS: ChipSelectOption[] = [
  { value: "none", label: "None" },
  { value: "heated", label: "Heated" },
  { value: "oiled", label: "Oiled" },
];

const SHAPES: ChipSelectOption[] = [
  { value: "round", label: "Round" },
  { value: "oval", label: "Oval" },
  { value: "cushion", label: "Cushion" },
  { value: "princess", label: "Princess" },
];

export const SingleSelect: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <ChipSelectFilter
        mode="single"
        value={value}
        onChange={setValue}
        options={TREATMENTS}
      />
    );
  },
};

export const SingleSelectEngaged: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>("heated");
    return (
      <ChipSelectFilter
        mode="single"
        value={value}
        onChange={setValue}
        options={TREATMENTS}
      />
    );
  },
};

export const MultipleSelect: Story = {
  render: () => {
    const [value, setValue] = useState<string[] | undefined>(undefined);
    return (
      <ChipSelectFilter
        mode="multiple"
        value={value}
        onChange={setValue}
        options={COLORS}
      />
    );
  },
};

export const MultipleSelectEngaged: Story = {
  render: () => {
    const [value, setValue] = useState<string[] | undefined>(["blue", "green"]);
    return (
      <ChipSelectFilter
        mode="multiple"
        value={value}
        onChange={setValue}
        options={COLORS}
      />
    );
  },
};

export const RichRenderOption: Story = {
  render: () => {
    const options: ChipSelectOption[] = SHAPES.map((o) => ({
      ...o,
      renderOption: ({ selected }) => (
        <div className="flex flex-col items-center gap-1 px-2 py-1">
          <span aria-hidden className={selected ? "opacity-100" : "opacity-60"}>
            ◆
          </span>
          <span className="text-xs">{o.label}</span>
        </div>
      ),
    }));
    const [value, setValue] = useState<string[] | undefined>(undefined);
    return (
      <ChipSelectFilter
        mode="multiple"
        value={value}
        onChange={setValue}
        options={options}
      />
    );
  },
};
