import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FilterButton } from "./filter-button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../atoms/toggle-group/toggle-group";

const meta: Meta<typeof FilterButton> = {
  title: "Filtering/FilterButton",
  component: FilterButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FilterButton>;

const COLOR_OPTIONS = [
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
];

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
        <ToggleGroup
          type="multiple"
          variant="outline"
          spacing={2}
          value={draft ?? []}
          onValueChange={(next: string[]) =>
            setDraft(next.length > 0 ? next : undefined)
          }
        >
          {COLOR_OPTIONS.map((o) => (
            <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
              {o.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
    </FilterButton>
  );
}

export const Inactive: Story = { render: () => <Controlled /> };
export const Active: Story = {
  render: () => <Controlled initial={["blue", "green"]} />,
};
