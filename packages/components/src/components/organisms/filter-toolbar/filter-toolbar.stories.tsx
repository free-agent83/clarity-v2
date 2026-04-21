import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState, type ReactNode } from "react";
import { FilterToolbar, FilterSection } from "./filter-toolbar";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
} from "../../organisms/app-shell/app-shell";
import { FilterButton } from "../../atoms/filter-button/filter-button";
import {
  ChipSelectFilter,
  type ChipSelectOption,
} from "../../molecules/chip-select-filter/chip-select-filter";
import { RangeFilter } from "../../molecules/range-filter/range-filter";
import type { RangeAxis } from "../../molecules/range-filter/range-filter";

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

const COLOR_OPTIONS: ChipSelectOption[] = [
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
  { value: "teal", label: "Teal" },
  { value: "pink", label: "Pink" },
  { value: "yellow", label: "Yellow" },
];

const PRICE_AXIS: RangeAxis = {
  id: "price",
  min: 0,
  max: 10000,
  step: 10,
  unit: "$",
};

function formatMultiSelectChip(labels: string[]): string {
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]}, ${labels[1]}`;
  return `${labels[0]}, ${labels[1]} +${labels.length - 2} more`;
}

function labelForValue(options: ChipSelectOption[], v: string) {
  return options.find((o) => o.value === v)?.label ?? v;
}

type PriceValue = Record<string, { min: number; max: number }> | undefined;

function Controlled({ hasActiveFilters = false }: { hasActiveFilters?: boolean }) {
  const [sort, setSort] = useState("price-asc");
  const [colors, setColors] = useState<string[] | undefined>(
    hasActiveFilters ? ["blue", "green"] : undefined
  );
  const [draftColors, setDraftColors] = useState<string[] | undefined>(colors);

  const colorButton: ReactNode = (
    <FilterButton<string[]>
      key="color"
      label="Color"
      chipSummary={formatMultiSelectChip(
        (colors ?? []).map((v) => labelForValue(COLOR_OPTIONS, v))
      )}
      isActive={(colors ?? []).length > 0}
      initialValue={colors}
      popoverWidth={320}
      onApply={(v) => setColors(v)}
      onClear={() => setColors(undefined)}
      onDismiss={() => setColors(undefined)}
    >
      {(draft, setDraft) => (
        <ChipSelectFilter
          mode="multiple"
          value={draft}
          onChange={setDraft}
          options={COLOR_OPTIONS}
        />
      )}
    </FilterButton>
  );

  const activeCount = colors ? 1 : 0;

  return (
    <div className="p-4">
      <FilterToolbar
        filters={[colorButton]}
        stickyFilters={colors ? [colorButton] : []}
        activeFilterCount={activeCount}
        hasActiveFilters={activeCount > 0}
        onClearAll={() => setColors(undefined)}
        onSearchSubmit={fn()}
        searchPlaceholder="Search..."
        sortOptions={SORT_OPTIONS}
        sortValue={sort}
        onSortChange={setSort}
        drawer={{
          content: (
            <FilterSection label="Color" separator={false}>
              <ChipSelectFilter
                mode="multiple"
                value={draftColors}
                onChange={setDraftColors}
                options={COLOR_OPTIONS}
              />
            </FilterSection>
          ),
          onOpen: () => setDraftColors(colors),
          onApply: () => setColors(draftColors),
          onClearDraft: () => setDraftColors(undefined),
          hasActiveDraft: (draftColors ?? []).length > 0,
          resultsCount: hasActiveFilters ? 342 : undefined,
        }}
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
 * story seeds two active filters. A long grid wireframe below provides
 * enough scroll distance to trigger the IntersectionObserver.
 */
export const StickyBarBehaviour: Story = {
  parameters: { layout: "fullscreen" },
  render: () => {
    const [sort, setSort] = useState("price-asc");
    const [colors, setColors] = useState<string[] | undefined>([
      "blue",
      "green",
    ]);
    const [price, setPrice] = useState<PriceValue>({
      price: { min: 500, max: 5000 },
    });
    const [draftColors, setDraftColors] = useState<string[] | undefined>(colors);
    const [draftPrice, setDraftPrice] = useState<PriceValue>(price);

    const colorButton: ReactNode = (
      <FilterButton<string[]>
        key="color"
        label="Color"
        chipSummary={formatMultiSelectChip(
          (colors ?? []).map((v) => labelForValue(COLOR_OPTIONS, v))
        )}
        isActive={(colors ?? []).length > 0}
        initialValue={colors}
        popoverWidth={320}
        onApply={(v) => setColors(v)}
        onClear={() => setColors(undefined)}
        onDismiss={() => setColors(undefined)}
      >
        {(draft, setDraft) => (
          <ChipSelectFilter
            mode="multiple"
            value={draft}
            onChange={setDraft}
            options={COLOR_OPTIONS}
          />
        )}
      </FilterButton>
    );

    const priceButton: ReactNode = (
      <FilterButton<PriceValue>
        key="price"
        label="Price"
        chipSummary={
          price?.price
            ? `$${price.price.min}\u2013$${price.price.max}`
            : undefined
        }
        isActive={!!price}
        initialValue={price}
        onApply={(v) => setPrice(v)}
        onClear={() => setPrice(undefined)}
        onDismiss={() => setPrice(undefined)}
      >
        {(draft, setDraft) => (
          <RangeFilter value={draft} onChange={setDraft} axes={[PRICE_AXIS]} />
        )}
      </FilterButton>
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
            onClearAll={clearAll}
            onSearchSubmit={fn()}
            searchPlaceholder="Search..."
            sortOptions={SORT_OPTIONS}
            sortValue={sort}
            onSortChange={setSort}
            drawer={{
              content: (
                <>
                  <FilterSection label="Color" separator={false}>
                    <ChipSelectFilter
                      mode="multiple"
                      value={draftColors}
                      onChange={setDraftColors}
                      options={COLOR_OPTIONS}
                    />
                  </FilterSection>
                  <FilterSection label="Price">
                    <RangeFilter
                      value={draftPrice}
                      onChange={setDraftPrice}
                      axes={[PRICE_AXIS]}
                    />
                  </FilterSection>
                </>
              ),
              onOpen: () => {
                setDraftColors(colors);
                setDraftPrice(price);
              },
              onApply: () => {
                setColors(draftColors);
                setPrice(draftPrice);
              },
              onClearDraft: () => {
                setDraftColors(undefined);
                setDraftPrice(undefined);
              },
              hasActiveDraft:
                (draftColors ?? []).length > 0 || draftPrice !== undefined,
              resultsCount: 342,
            }}
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
