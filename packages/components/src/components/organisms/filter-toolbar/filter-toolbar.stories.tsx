import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import { FilterToolbar } from "./filter-toolbar";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
} from "../../organisms/app-shell/app-shell";

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

  // A raw button stands in here to keep this story focused on the toolbar
  // itself. See templates/plp/plp.stories.tsx for the full FilterButton +
  // ChipSelectFilter wiring that a real consumer would use.
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

/**
 * Demonstrates the sticky chrome: scroll the preview to see the main
 * toolbar fall off the top of the viewport and the compact sticky bar
 * fade in under the `AppShellHeader` (offset: 72px by default).
 *
 * The sticky bar only appears when `hasActiveFilters` is true — so this
 * story seeds an active "Color" filter. A long grid wireframe below
 * provides enough scroll distance to trigger the IntersectionObserver.
 */
export const StickyBarBehaviour: Story = {
  parameters: { layout: "fullscreen" },
  render: () => {
    const [sort, setSort] = useState("price-asc");
    const [colors, setColors] = useState<string[] | undefined>([
      "blue",
      "green",
    ]);
    const [price, setPrice] = useState<{ min: number; max: number } | undefined>({
      min: 500,
      max: 5000,
    });

    const colorButton = (
      <button
        key="color"
        type="button"
        className="h-11 rounded-md border px-3 text-sm"
      >
        Color{colors ? `: ${colors.join(", ")}` : ""}
      </button>
    );

    const priceButton = (
      <button
        key="price"
        type="button"
        className="h-11 rounded-md border px-3 text-sm"
      >
        Price{price ? `: $${price.min}–$${price.max}` : ""}
      </button>
    );

    const engagedButtons = [
      ...(colors ? [colorButton] : []),
      ...(price ? [priceButton] : []),
    ];

    const activeCount = (colors ? 1 : 0) + (price ? 1 : 0);

    function clearAll() {
      setColors(undefined);
      setPrice(undefined);
    }

    return (
      <AppShell>
        <AppShellHeader onSearch={fn()} />
        <AppShellMain>
          <FilterToolbar
            filters={engagedButtons}
            stickyFilters={engagedButtons}
            activeFilterCount={activeCount}
            hasActiveFilters={activeCount > 0}
            onOpenDrawer={fn()}
            onClearAll={clearAll}
            onSearchSubmit={fn()}
            searchPlaceholder="Search..."
            sortOptions={SORT_OPTIONS}
            sortValue={sort}
            onSortChange={setSort}
          />

          {/* Long scrollable wireframe so the sticky bar has distance to
              activate. Forty placeholder tiles, 4 columns, ~10 rows of
              content. */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={i}
                className="flex aspect-square items-center justify-center rounded-lg border bg-muted/40 text-sm text-muted-foreground"
              >
                Item {i + 1}
              </div>
            ))}
          </div>
        </AppShellMain>
      </AppShell>
    );
  },
};
