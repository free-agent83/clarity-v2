import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import { FilterToolbar } from "./filter-toolbar";

const meta: Meta<typeof FilterToolbar> = {
  title: "Filtering/FilterToolbar",
  component: FilterToolbar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof FilterToolbar>;

const SORT_OPTIONS = [
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "newest", label: "Newest" },
];

function Controlled({ hasActiveFilters = false }: { hasActiveFilters?: boolean }) {
  const [sort, setSort] = useState("price-asc");
  const [colors, setColors] = useState<string[] | undefined>(
    hasActiveFilters ? ["blue", "green"] : undefined
  );

  // Placeholder filter button — Task 9 rewrites FilterButton with the
  // generic render-prop API that the real story will demonstrate.
  const colorButton = (
    <button
      key="color"
      type="button"
      className="h-11 rounded-md border px-3 text-sm"
    >
      Color{colors ? `: ${colors.join(", ")}` : ""}
    </button>
  );

  const activeCount = colors ? 1 : 0;

  return (
    <div className="p-4">
      <FilterToolbar
        filters={[colorButton]}
        stickyFilters={colors ? [colorButton] : []}
        activeFilterCount={activeCount}
        hasActiveFilters={activeCount > 0}
        onOpenDrawer={fn()}
        onClearAll={() => setColors(undefined)}
        onSearchSubmit={fn()}
        searchPlaceholder="Search..."
        sortOptions={SORT_OPTIONS}
        sortValue={sort}
        onSortChange={setSort}
      />
    </div>
  );
}

export const Default: Story = { render: () => <Controlled /> };
export const WithActiveFilters: Story = {
  render: () => <Controlled hasActiveFilters />,
};
