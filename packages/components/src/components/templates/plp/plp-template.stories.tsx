import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useRef, useState, type ReactNode } from "react";
import { PlpTemplate, type PlpTemplateProps } from "./plp-template";
import {
  PlpGridItem,
  PlpGridItemDelivery,
  PlpGridItemMedia,
  PlpGridItemName,
  PlpGridItemPrice,
  PlpGridItemReturnable,
} from "./grid/plp-grid-item";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
} from "../../organisms/app-shell/app-shell";
import { Typography } from "../../atoms/typography/typography";
import type {
  FilterDefinition,
  FilterState,
  PlpViewMode,
} from "./plp-types";
import { SORT_OPTIONS, mockPreviewCount } from "./mocks/common";
import { MOCK_LATENCY } from "./mocks/simulate-api-call";
import {
  GEMSTONE_FILTERS,
  GEMSTONE_LIST_COLUMNS,
  GemstonePlpGridItem,
  generateGemstoneItems,
  gemstoneRenderGridItem,
  type GemstoneItem,
} from "./mocks/gemstone";
import {
  DIAMOND_FILTERS,
  DIAMOND_LIST_COLUMNS,
  DiamondPlpGridItem,
  diamondRenderGridItem,
  generateDiamondItems,
  type DiamondItem,
} from "./mocks/diamond";

// ── Stateful wrapper for interactive stories ──────────────

function PlpTemplateInteractive<TListItem = never>({
  initialFilterState = {},
  initialViewMode = "grid",
  ...props
}: Omit<
  PlpTemplateProps<TListItem>,
  | "filterState"
  | "onFilterChange"
  | "sortValue"
  | "onSortChange"
  | "page"
  | "onPageChange"
  | "pageSize"
  | "onPageSizeChange"
  | "viewMode"
  | "onViewModeChange"
  | "filteredResultsCount"
  | "onDraftFilterStateChange"
  | "isCountLoading"
  | "status"
> & {
  initialFilterState?: FilterState;
  initialViewMode?: PlpViewMode;
  sortValue: string;
  page: number;
  pageSize: number;
  /** Initial preview count shown on the drawer's primary button. */
  filteredResultsCount?: number;
  /** Baseline status — the wrapper flips this to "loading" during simulated commits. */
  status?: PlpTemplateProps<TListItem>["status"];
}) {
  const baselineStatus = props.status ?? "success";

  const [filterState, setFilterState] = useState<FilterState>(initialFilterState);
  const [sortValue, setSortValue] = useState(props.sortValue);
  const [page, setPage] = useState(props.page);
  const [pageSize, setPageSize] = useState(props.pageSize);
  const [viewMode, setViewMode] = useState<PlpViewMode>(initialViewMode);
  const [previewCount, setPreviewCount] = useState<number | undefined>(
    props.filteredResultsCount
  );
  const [isCountLoading, setIsCountLoading] = useState(false);
  const [effectiveStatus, setEffectiveStatus] =
    useState<PlpTemplateProps<TListItem>["status"]>(baselineStatus);

  // Debounced preview-count fetcher — consumer-side concern in real apps;
  // here we keep it inline so stories are self-contained.
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function schedulePreviewCount(draft: FilterState) {
    setIsCountLoading(true);
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(async () => {
      const count = await mockPreviewCount(draft);
      setPreviewCount(count);
      setIsCountLoading(false);
    }, 200);
  }

  // Simulate a backend roundtrip after any applied filter change. Flips
  // `status` to "loading" for ~commit ms so the grid/list shows its
  // skeleton, then restores the baseline status. Only active when
  // baseline is "success" — other states are left alone.
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function simulateBackendCommit() {
    if (baselineStatus !== "success") return;
    setEffectiveStatus("loading");
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    statusTimerRef.current = setTimeout(() => {
      setEffectiveStatus(baselineStatus);
    }, MOCK_LATENCY.commit);
  }

  return (
    <PlpTemplate
      {...props}
      status={effectiveStatus}
      filterState={filterState}
      onFilterChange={(id, value) => {
        setFilterState((prev) => {
          const next = { ...prev };
          if (value === undefined) {
            delete next[id];
          } else {
            next[id] = value;
          }
          schedulePreviewCount(next);
          return next;
        });
        simulateBackendCommit();
      }}
      filteredResultsCount={previewCount}
      isCountLoading={isCountLoading}
      onDraftFilterStateChange={schedulePreviewCount}
      sortValue={sortValue}
      onSortChange={setSortValue}
      page={page}
      onPageChange={setPage}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  );
}

// ── Helpers ───────────────────────────────────────────────

function buildGemstoneCards(count: number): ReactNode[] {
  return generateGemstoneItems(count).map((item) => (
    <GemstonePlpGridItem key={item.id} item={item} />
  ));
}

function buildDiamondCards(count: number): ReactNode[] {
  return generateDiamondItems(count).map((item) => (
    <DiamondPlpGridItem key={item.id} item={item} />
  ));
}

// ── Story meta ────────────────────────────────────────────

const meta: Meta = {
  title: "Templates/PLP",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <AppShell>
        <AppShellHeader onSearch={fn()} />
        <AppShellMain>
          <Story />
        </AppShellMain>
      </AppShell>
    ),
  ],
};

export default meta;

// ── Stories ───────────────────────────────────────────────

export const GemstoneCategory: StoryObj = {
  render: () => (
    <PlpTemplateInteractive
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={1234567}
      filters={GEMSTONE_FILTERS}
      filteredResultsCount={10234}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      searchPlaceholder="Search by certificate number or stock ID..."
      onSearchSubmit={fn()}
      gridItems={buildGemstoneCards(20)}
      page={1}
      pageSize={20}
      totalItems={1234567}
      status="success"
      onRetry={fn()}
    />
  ),
};

export const DiamondsCategory: StoryObj = {
  render: () => (
    <PlpTemplateInteractive
      breadcrumbs={[{ label: "Diamonds", href: "#" }, { label: "Natural" }]}
      title="Natural Diamonds"
      resultsCount={48291}
      filters={DIAMOND_FILTERS}
      filteredResultsCount={48291}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      searchPlaceholder="Search by certificate number or stock ID..."
      onSearchSubmit={fn()}
      gridItems={buildDiamondCards(20)}
      page={1}
      pageSize={20}
      totalItems={48291}
      status="success"
      onRetry={fn()}
    />
  ),
};

export const JewelryCategory: StoryObj = {
  render: () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      id: `ring-${i}`,
      name: "Three-Stone Anniversary Band",
      image: `https://placehold.co/400x400/f5f5f4/a3a3a3?text=Ring+${i + 1}`,
      sku: "SKU 100019ERDPL",
      price: 9999.0,
    }));

    const jewelryFilters: FilterDefinition[] = [
      { id: "stone-shape", label: "Stone shape", preset: "multi-select-chips", isQuickFilter: true, options: [
        { value: "round", label: "Round" }, { value: "oval", label: "Oval" }, { value: "cushion", label: "Cushion" },
      ]},
      { id: "metal", label: "Metal", preset: "multi-select-chips", isQuickFilter: true, options: [
        { value: "gold", label: "Gold" }, { value: "platinum", label: "Platinum" }, { value: "silver", label: "Silver" },
      ]},
      { id: "style", label: "Style", preset: "multi-select-chips", options: [
        { value: "solitaire", label: "Solitaire" }, { value: "halo", label: "Halo" }, { value: "three-stone", label: "Three stone" },
      ]},
    ];

    const gridItems: ReactNode[] = items.map((item) => (
      <PlpGridItem key={item.id}>
        <PlpGridItemMedia image={item.image} imageAlt={item.name} />
        <PlpGridItemName>{item.name}</PlpGridItemName>
        <Typography variant="caption" className="text-muted-foreground">
          Wedding ring · {item.sku}
        </Typography>
        <div className="flex gap-1">
          {["⚪", "🟡", "🔵", "⬛"].map((s, i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-full border text-[8px] flex items-center justify-center"
            >
              {s}
            </span>
          ))}
        </div>
        <PlpGridItemDelivery
          variant="regular"
          date="Nov 18 – 23"
          shipsFrom="United States"
        />
        <PlpGridItemReturnable variant="returnable" />
        <PlpGridItemPrice amount={item.price} currency="USD" />
      </PlpGridItem>
    ));

    return (
      <PlpTemplateInteractive
        breadcrumbs={[{ label: "Jewelry", href: "#" }, { label: "Wedding rings" }]}
        title="Wedding rings"
        resultsCount={1234567}
        filters={jewelryFilters}
        filteredResultsCount={1234567}
        sortOptions={[{ value: "featured", label: "Featured" }, ...SORT_OPTIONS.slice(0, 2)]}
        sortValue="featured"
        gridItems={gridItems}
        page={1}
        pageSize={20}
        totalItems={1234567}
        status="success"
        onRetry={fn()}
      />
    );
  },
};

export const WithActiveFilters: StoryObj = {
  render: () => (
    <PlpTemplateInteractive
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={342}
      filters={GEMSTONE_FILTERS}
      initialFilterState={{
        color: ["blue", "green"],
        treatment: "heated",
        price: { min: 1000, max: 5000 },
        supplier: ["sup-acme", "sup-globex", "sup-initech"],
      }}
      filteredResultsCount={342}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      gridItems={buildGemstoneCards(20)}
      page={1}
      pageSize={20}
      totalItems={342}
      status="success"
      onRetry={fn()}
    />
  ),
};

export const WithCustomFilter: StoryObj = {
  render: () => {
    const filtersWithCustom: FilterDefinition[] = [
      ...GEMSTONE_FILTERS.slice(0, 2),
      {
        id: "custom-rating",
        label: "Quality Rating",
        preset: "custom",
        isQuickFilter: true,
        renderControl: ({ value, onChange }) => (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-xl ${Number(value) >= star ? "text-warning" : "text-muted"}`}
                onClick={() => onChange(String(star))}
              >
                ★
              </button>
            ))}
          </div>
        ),
        formatChipValue: (value) => `${value}+ stars`,
      },
    ];

    return (
      <PlpTemplateInteractive
        breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
        title="Sapphire"
        resultsCount={1234567}
        filters={filtersWithCustom}
        filteredResultsCount={10234}
        sortOptions={SORT_OPTIONS}
        sortValue="price-asc"
        gridItems={buildGemstoneCards(20)}
        page={1}
        pageSize={20}
        totalItems={1234567}
        status="success"
        onRetry={fn()}
      />
    );
  },
};

export const Loading: StoryObj = {
  render: () => (
    <PlpTemplate
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={0}
      filters={GEMSTONE_FILTERS}
      filterState={{}}
      onFilterChange={fn()}
      onDraftFilterStateChange={fn()}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      onSortChange={fn()}
      page={1}
      pageSize={20}
      totalItems={0}
      onPageChange={fn()}
      onPageSizeChange={fn()}
      status="loading"
    />
  ),
};

export const EmptyFiltered: StoryObj = {
  render: () => (
    <PlpTemplateInteractive
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={0}
      filters={GEMSTONE_FILTERS}
      initialFilterState={{ color: ["pink"], clarity: ["eye-clean"] }}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      page={1}
      pageSize={20}
      totalItems={0}
      status="empty-filtered"
      emptyFilterSuggestions={["Color", "Clarity"]}
    />
  ),
};

export const EmptyNoItems: StoryObj = {
  render: () => (
    <PlpTemplate
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Alexandrite" }]}
      title="Alexandrite"
      resultsCount={0}
      filters={[]}
      filterState={{}}
      onFilterChange={fn()}
      onDraftFilterStateChange={fn()}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      onSortChange={fn()}
      page={1}
      pageSize={20}
      totalItems={0}
      onPageChange={fn()}
      onPageSizeChange={fn()}
      status="empty-no-items"
      emptyMessage="No alexandrite available at the moment."
    />
  ),
};

export const Error: StoryObj = {
  render: () => (
    <PlpTemplate
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={0}
      filters={GEMSTONE_FILTERS}
      filterState={{}}
      onFilterChange={fn()}
      onDraftFilterStateChange={fn()}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      onSortChange={fn()}
      page={1}
      pageSize={20}
      totalItems={0}
      onPageChange={fn()}
      onPageSizeChange={fn()}
      status="error"
      onRetry={fn()}
    />
  ),
};

// List-view stories — legacy data-driven API, pending list-view refactor.
// These stories still exercise the `listItems` + `renderListItem` path.

export const DiamondListView: StoryObj = {
  render: () => (
    <PlpTemplateInteractive<DiamondItem>
      breadcrumbs={[{ label: "Diamonds", href: "#" }, { label: "Natural" }]}
      title="Natural Diamonds"
      resultsCount={48291}
      filters={DIAMOND_FILTERS}
      filteredResultsCount={48291}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      gridItems={buildDiamondCards(20)}
      listItems={generateDiamondItems(20)}
      renderListItem={diamondRenderGridItem}
      listColumns={DIAMOND_LIST_COLUMNS}
      initialViewMode="list"
      onItemClick={fn()}
      page={1}
      pageSize={20}
      totalItems={48291}
      status="success"
      onRetry={fn()}
    />
  ),
};

export const GemstoneListView: StoryObj = {
  render: () => (
    <PlpTemplateInteractive<GemstoneItem>
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={1234567}
      filters={GEMSTONE_FILTERS}
      filteredResultsCount={10234}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      gridItems={buildGemstoneCards(20)}
      listItems={generateGemstoneItems(20)}
      renderListItem={gemstoneRenderGridItem}
      listColumns={GEMSTONE_LIST_COLUMNS}
      initialViewMode="list"
      onItemClick={fn()}
      page={1}
      pageSize={20}
      totalItems={1234567}
      status="success"
      onRetry={fn()}
    />
  ),
};
