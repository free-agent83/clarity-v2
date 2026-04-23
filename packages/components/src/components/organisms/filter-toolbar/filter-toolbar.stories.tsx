import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/test";
import type { ReactNode } from "react";
import { FilterToolbar, FilterSection } from "./filter-toolbar";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
} from "../app-shell/app-shell";
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

// ── Static fixtures ───────────────────────────────────────────────────

const noop = () => {};

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

type PriceValue = Record<string, { min: number; max: number }> | undefined;

// ── Static filter button factories ────────────────────────────────────
//
// Each factory returns a FilterButton with real popover content and an
// internal draft, but `onApply` / `onClear` are no-ops. Readers can
// open the popover and toggle chips or drag sliders, but committing
// never flips the toolbar chip's visual state — stories illustrate one
// fixed snapshot.

function buildColorButton(
  selected: string[] | undefined,
  chipSummary: string | undefined
): ReactNode {
  return (
    <FilterButton<string[]>
      key="color"
      label="Color"
      chipSummary={chipSummary}
      isActive={(selected ?? []).length > 0}
      initialValue={selected}
      popoverWidth={320}
      onApply={noop}
      onClear={noop}
      onDismiss={noop}
    >
      {(draft, setDraft) => (
        <ToggleGroup
          type="multiple"
          variant="outline"
          spacing={2}
          className="flex-wrap"
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

function buildPriceButton(
  selected: PriceValue,
  chipSummary: string | undefined
): ReactNode {
  return (
    <FilterButton<PriceValue>
      key="price"
      label="Price"
      chipSummary={chipSummary}
      isActive={!!selected}
      initialValue={selected}
      onApply={noop}
      onClear={noop}
      onDismiss={noop}
    >
      {(draft, setDraft) => (
        <RangeFilter value={draft} onChange={setDraft} axes={[PRICE_AXIS]} />
      )}
    </FilterButton>
  );
}

function buildSimpleChipButton(
  key: string,
  label: string,
  chipSummary: string
): ReactNode {
  return (
    <FilterButton<string[]>
      key={key}
      label={label}
      chipSummary={chipSummary}
      isActive
      initialValue={["placeholder"]}
      popoverWidth={280}
      onApply={noop}
      onClear={noop}
      onDismiss={noop}
    >
      {() => (
        <div className="text-sm text-muted-foreground">
          Illustrative only — this filter's popover body is elided.
        </div>
      )}
    </FilterButton>
  );
}

// ── Static drawer sections ────────────────────────────────────────────

const colorDrawerSection: ReactNode = (
  <FilterSection label="Color" separator={false}>
    <ToggleGroup
      type="multiple"
      variant="outline"
      spacing={2}
      className="flex-wrap"
    >
      {COLOR_OPTIONS.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  </FilterSection>
);

const priceDrawerSection: ReactNode = (
  <FilterSection label="Price">
    <RangeFilter value={undefined} onChange={noop} axes={[PRICE_AXIS]} />
  </FilterSection>
);

// ── Stories ───────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div className="p-4">
      <FilterToolbar
        filters={[buildColorButton(undefined, undefined)]}
        activeFilterCount={0}
        hasActiveFilters={false}
        onClearAll={noop}
        onSearchSubmit={noop}
        searchPlaceholder="Search..."
        sortOptions={SORT_OPTIONS}
        sortValue="price-asc"
        onSortChange={noop}
        drawer={{
          content: colorDrawerSection,
          onApply: noop,
          hasActiveDraft: false,
        }}
      />
    </div>
  ),
};

/**
 * Shows the toolbar with a single filter in its active state. Opening
 * the quick-filter popover or the drawer lets readers manipulate the
 * draft, but Apply is a no-op — the toolbar chip stays fixed.
 */
export const WithActiveFilters: Story = {
  render: () => {
    const selectedColors = ["blue", "green"];
    const colorButton = buildColorButton(selectedColors, "Blue, Green");
    return (
      <div className="p-4">
        <FilterToolbar
          filters={[colorButton]}
          stickyFilters={[colorButton]}
          activeFilterCount={1}
          hasActiveFilters
          onClearAll={noop}
          onSearchSubmit={noop}
          searchPlaceholder="Search..."
          sortOptions={SORT_OPTIONS}
          sortValue="price-asc"
          onSortChange={noop}
          drawer={{
            content: colorDrawerSection,
            onApply: noop,
            onClearDraft: noop,
            hasActiveDraft: true,
            resultsCount: 342,
          }}
        />
      </div>
    );
  },
};

/**
 * Drawer loading state — the "Show X results" Apply button renders a
 * spinner and is disabled while a preview-count fetch is in flight.
 *
 * Auto-opens the drawer via a `play` function so the loading state is
 * immediately visible without manual interaction.
 */
export const DrawerLoadingState: Story = {
  render: () => {
    const colorButton = buildColorButton(["blue", "green"], "Blue, Green");
    return (
      <div className="p-4">
        <FilterToolbar
          filters={[colorButton]}
          stickyFilters={[colorButton]}
          activeFilterCount={1}
          hasActiveFilters
          onClearAll={noop}
          sortOptions={SORT_OPTIONS}
          sortValue="price-asc"
          onSortChange={noop}
          drawer={{
            content: colorDrawerSection,
            onApply: noop,
            onClearDraft: noop,
            hasActiveDraft: true,
            resultsCount: 1234,
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
 * The sticky bar only appears when `hasActiveFilters` is true, so this
 * story seeds two active filters. A long grid wireframe below provides
 * enough scroll distance to trigger the IntersectionObserver.
 */
export const StickyBarBehaviour: Story = {
  parameters: { layout: "fullscreen" },
  render: () => {
    const colorButton = buildColorButton(["blue", "green"], "Blue, Green");
    const priceButton = buildPriceButton(
      { price: { min: 500, max: 5000 } },
      "$500–$5000"
    );
    const engagedButtons = [colorButton, priceButton];
    return (
      <AppShell>
        <AppShellHeader onSearch={noop} />
        <AppShellMain>
          <FilterToolbar
            filters={engagedButtons}
            stickyFilters={engagedButtons}
            activeFilterCount={2}
            hasActiveFilters
            onClearAll={noop}
            onSearchSubmit={noop}
            searchPlaceholder="Search..."
            sortOptions={SORT_OPTIONS}
            sortValue="price-asc"
            onSortChange={noop}
            drawer={{
              content: (
                <>
                  {colorDrawerSection}
                  {priceDrawerSection}
                </>
              ),
              onApply: noop,
              onClearDraft: noop,
              hasActiveDraft: true,
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
 * Stress-test of the sticky bar with many active filters. Useful to
 * eyeball the chip row's wrapping behaviour, the "A, B, C, +N" overflow
 * on narrow viewports, and the clear-all / active-count affordances when
 * the chip set is dense. Same structure as `StickyBarBehaviour` — only
 * the engaged-filters list differs.
 */
export const StickyBarManyFilters: Story = {
  parameters: { layout: "fullscreen" },
  render: () => {
    const engagedButtons = [
      buildColorButton(["blue", "green", "red", "yellow", "pink"], "Blue, Green, Red, +2"),
      buildPriceButton(
        { price: { min: 500, max: 5000 } },
        "$500–$5000"
      ),
      buildSimpleChipButton("shape", "Shape", "Round, Oval, Emerald, +2"),
      buildSimpleChipButton("clarity", "Clarity", "VVS1, VVS2, VS1, +1"),
      buildSimpleChipButton("carat", "Carat", "1.5–3.0ct"),
      buildSimpleChipButton("origin", "Origin", "Botswana"),
      buildSimpleChipButton("lab", "Lab", "GIA, IGI"),
      buildSimpleChipButton("treatment", "Treatment", "None"),
      buildSimpleChipButton("fluorescence", "Fluorescence", "None, Faint"),
      buildSimpleChipButton("polish", "Polish", "Excellent"),
    ];
    return (
      <AppShell>
        <AppShellHeader onSearch={noop} />
        <AppShellMain>
          <FilterToolbar
            filters={engagedButtons}
            stickyFilters={engagedButtons}
            activeFilterCount={engagedButtons.length}
            hasActiveFilters
            onClearAll={noop}
            onSearchSubmit={noop}
            searchPlaceholder="Search..."
            sortOptions={SORT_OPTIONS}
            sortValue="price-asc"
            onSortChange={noop}
            drawer={{
              content: (
                <>
                  {colorDrawerSection}
                  {priceDrawerSection}
                </>
              ),
              onApply: noop,
              onClearDraft: noop,
              hasActiveDraft: true,
              resultsCount: 342,
            }}
          />

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
          onClearAll={noop}
          sortOptions={SORT_OPTIONS}
          sortValue="price-asc"
          onSortChange={noop}
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

                <FilterSection label="Certification">
                  <Wireframe label="Chip group control" />
                </FilterSection>
              </>
            ),
            onApply: noop,
            onClearDraft: noop,
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
