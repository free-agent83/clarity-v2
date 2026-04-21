import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { PlpFilterSection } from "./plp-filter-section";
import { MultiSelectChipsFilter } from "./presets/multi-select-chips";
import { RangeSliderFilter } from "./presets/range-slider";

const meta: Meta<typeof PlpFilterSection> = {
  title: "Templates/PLP/Filters/FilterSection",
  component: PlpFilterSection,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PlpFilterSection>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string[] | undefined>(undefined);
    return (
      <div className="w-80">
        <PlpFilterSection label="Color" separator={false}>
          <MultiSelectChipsFilter
            value={value}
            onChange={setValue}
            options={[
              { value: "blue", label: "Blue" },
              { value: "green", label: "Green" },
              { value: "red", label: "Red" },
            ]}
          />
        </PlpFilterSection>
      </div>
    );
  },
};

export const MultipleSections: Story = {
  render: () => {
    const [colors, setColors] = useState<string[] | undefined>(undefined);
    const [price, setPrice] = useState<
      { min: number; max: number } | undefined
    >(undefined);
    return (
      <div className="w-80">
        <PlpFilterSection label="Color" separator={false}>
          <MultiSelectChipsFilter
            value={colors}
            onChange={setColors}
            options={[
              { value: "blue", label: "Blue" },
              { value: "green", label: "Green" },
              { value: "red", label: "Red" },
            ]}
          />
        </PlpFilterSection>
        <PlpFilterSection label="Price">
          <RangeSliderFilter
            value={price}
            onChange={setPrice}
            min={0}
            max={10000}
            step={10}
            unit="$"
          />
        </PlpFilterSection>
      </div>
    );
  },
};
