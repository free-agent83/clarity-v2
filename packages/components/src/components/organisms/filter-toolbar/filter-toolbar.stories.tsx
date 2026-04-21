import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within } from "@storybook/test";
import { useState, type ReactNode } from "react";
import { FilterToolbar, FilterSection } from "./filter-toolbar";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
} from "../../organisms/app-shell/app-shell";
import { FilterButton } from "../../atoms/filter-button/filter-button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../atoms/toggle-group/toggle-group";
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

type Option = { value: string; label: string };

const SORT_OPTIONS: Option[] = [
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "newest", label: "Newest" },
];

const COLOR_OPTIONS: Option[] = [
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

function labelForValue(options: Option[], v: string) {
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
              <ToggleGroup
                type="multiple"
                variant="outline"
                spacing={2}
                value={draftColors ?? []}
                onValueChange={(next: string[]) =>
                  setDraftColors(next.length > 0 ? next : undefined)
                }
              >
                {COLOR_OPTIONS.map((o) => (
                  <ToggleGroupItem
                    key={o.value}
                    value={o.value}
                    aria-label={o.label}
                  >
                    {o.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
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
 * Drawer loading state — the "Show X results" Apply button renders a
 * spinner and is disabled while a preview-count fetch is in flight.
 *
 * The story auto-opens the drawer via a `play` function (click on the
 * All Filters button) so the loading state is immediately visible
 * without manual interaction.
 */
export const DrawerLoadingState: Story = {
  render: () => {
    const [sort, setSort] = useState("price-asc");
    const [colors, setColors] = useState<string[] | undefined>(["blue", "green"]);
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

    return (
      <div className="p-4">
        <FilterToolbar
          filters={[colorButton]}
          stickyFilters={[colorButton]}
          activeFilterCount={1}
          hasActiveFilters
          onClearAll={() => setColors(undefined)}
          sortOptions={SORT_OPTIONS}
          sortValue={sort}
          onSortChange={setSort}
          drawer={{
            content: (
              <FilterSection label="Color" separator={false}>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  spacing={2}
                  value={draftColors ?? []}
                  onValueChange={(next: string[]) =>
                    setDraftColors(next.length > 0 ? next : undefined)
                  }
                >
                  {COLOR_OPTIONS.map((o) => (
                    <ToggleGroupItem
                      key={o.value}
                      value={o.value}
                      aria-label={o.label}
                    >
                      {o.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FilterSection>
            ),
            onOpen: () => setDraftColors(colors),
            onApply: () => setColors(draftColors),
            onClearDraft: () => setDraftColors(undefined),
            hasActiveDraft: (draftColors ?? []).length > 0,
            resultsCount: 1234,
            // Frozen loading state for the demo — real consumers flip this
            // during a debounced preview-count fetch triggered by draft
            // state changes.
            isCountLoading: true,
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole("button", { name: /all filters/i });
    await userEvent.click(trigger);
  },
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
                    <ToggleGroup
                      type="multiple"
                      variant="outline"
                      spacing={2}
                      value={draftColors ?? []}
                      onValueChange={(next: string[]) =>
                        setDraftColors(next.length > 0 ? next : undefined)
                      }
                    >
                      {COLOR_OPTIONS.map((o) => (
                        <ToggleGroupItem
                          key={o.value}
                          value={o.value}
                          aria-label={o.label}
                        >
                          {o.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
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

/**
 * Drawer with many `FilterSection`s, including a section that composes
 * multiple nested subsections. The section bodies are wireframes so the
 * story focuses on layout and scrolling rather than on any specific
 * filter control.
 *
 * Auto-opens the drawer via a `play` function so the layout is visible
 * without manual interaction.
 */
export const DrawerMultipleSections: Story = {
  render: () => {
    function Wireframe({ label }: { label: string }) {
      return (
        <div className="flex h-10 items-center rounded-md border border-dashed border-border bg-muted/40 px-3 text-xs text-muted-foreground">
          {label}
        </div>
      );
    }

    return (
      <div className="p-4">
        <FilterToolbar
          filters={[]}
          activeFilterCount={0}
          hasActiveFilters={false}
          onClearAll={fn()}
          sortOptions={SORT_OPTIONS}
          sortValue="price-asc"
          onSortChange={fn()}
          drawer={{
            content: (
              <>
                <FilterSection label="Shape" separator={false}>
                  <Wireframe label="Chip group control" />
                </FilterSection>

                <FilterSection label="Colour">
                  <Wireframe label="Chip group control" />
                </FilterSection>

                {/* A section with multiple nested subsections. Each
                    subsection is itself a FilterSection rendered inside
                    the parent's body. `separator={false}` is used on the
                    first subsection to keep the nesting visually clean
                    (the parent already has its own separator above). */}
                <FilterSection label="Dimensions">
                  <div className="space-y-2">
                    <Wireframe label="Summary input" />
                    <div className="pl-3">
                      <FilterSection label="Length" separator={false}>
                        <Wireframe label="Range slider" />
                      </FilterSection>
                      <FilterSection label="Width">
                        <Wireframe label="Range slider" />
                      </FilterSection>
                      <FilterSection label="Depth">
                        <Wireframe label="Range slider" />
                      </FilterSection>
                    </div>
                  </div>
                </FilterSection>

                <FilterSection label="Price">
                  <Wireframe label="Range slider" />
                </FilterSection>

                <FilterSection label="Carat">
                  <Wireframe label="Range slider" />
                </FilterSection>

                <FilterSection label="Origin">
                  <Wireframe label="Chip group control" />
                </FilterSection>

                <FilterSection label="Supplier">
                  <Wireframe label="Async combobox" />
                </FilterSection>

                <FilterSection label="Certification">
                  <Wireframe label="Chip group control" />
                </FilterSection>
              </>
            ),
            onApply: fn(),
            onClearDraft: fn(),
            hasActiveDraft: false,
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole("button", { name: /all filters/i });
    await userEvent.click(trigger);
  },
};
