import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FilterButton } from "./filter-button";
import { ChipSelectFilter } from "../../molecules/chip-select-filter/chip-select-filter";

const meta: Meta<typeof FilterButton> = {
  title: "Filtering/FilterButton",
  component: FilterButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FilterButton>;

function Controlled({ initial }: { initial?: string[] }) {
  const [applied, setApplied] = useState<string[] | undefined>(initial);
  return (
    <FilterButton<string[]>
      label="Color"
      chipSummary={applied ? applied.join(", ") : undefined}
      isActive={!!applied}
      initialValue={applied}
      onApply={setApplied}
      onClear={() => setApplied(undefined)}
      onDismiss={() => setApplied(undefined)}
    >
      {(draft, setDraft) => (
        <ChipSelectFilter
          mode="multiple"
          value={draft}
          onChange={setDraft}
          options={[
            { value: "blue", label: "Blue" },
            { value: "green", label: "Green" },
            { value: "red", label: "Red" },
          ]}
        />
      )}
    </FilterButton>
  );
}

export const Inactive: Story = { render: () => <Controlled /> };
export const Active: Story = {
  render: () => <Controlled initial={["blue", "green"]} />,
};
