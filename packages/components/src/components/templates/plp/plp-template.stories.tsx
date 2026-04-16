import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import { PlpTemplate, type PlpTemplateProps } from "./plp-template";
import { PlpUserProvider } from "./context/plp-user-context";
import {
  AppShell,
  AppShellHeader,
  AppShellActions,
  AppShellMain,
} from "../../organisms/app-shell/app-shell";
import { Badge } from "../../atoms/badge/badge";
import type { FilterDefinition, FilterState, GridItemData, SortOption } from "./plp-types";

// ── Shared mock data ──────────────────────────────────────

const GEMSTONE_FILTERS: FilterDefinition[] = [
  {
    id: "nivoda-curated",
    label: "Nivoda Curated",
    preset: "boolean-chip",
    chipLabel: "Only Nivoda Curated items",
    isQuickFilter: true,
  },
  {
    id: "color",
    label: "Color",
    preset: "multi-select-chips",
    isQuickFilter: true,
    popoverWidth: 320,
    options: [
      { value: "blue", label: "Blue" },
      { value: "green", label: "Green" },
      { value: "red", label: "Red" },
      { value: "teal", label: "Teal" },
      { value: "pink", label: "Pink" },
      { value: "yellow", label: "Yellow" },
    ],
  },
  {
    id: "clarity",
    label: "Clarity",
    preset: "multi-select-chips",
    options: [
      { value: "eye-clean", label: "Eye clean" },
      { value: "slightly-included", label: "Slightly included" },
      { value: "moderately-included", label: "Moderately included" },
      { value: "visibly-included", label: "Visibly included" },
    ],
  },
  {
    id: "treatment",
    label: "Treatment",
    preset: "single-select-chips",
    options: [
      { value: "none", label: "None" },
      { value: "heated", label: "Heated" },
      { value: "oiled", label: "Oiled" },
    ],
  },
  {
    id: "location",
    label: "Location",
    preset: "single-select-dropdown",
    options: [
      { value: "us", label: "United States" },
      { value: "eu", label: "Europe" },
      { value: "asia", label: "Asia" },
    ],
  },
];

const SORT_OPTIONS: SortOption[] = [
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
];

function generateGemstoneItems(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `gem-${i}`,
    name: `Emerald Green Radiant ${(1 + i * 0.1).toFixed(1)}ct`,
    image: `https://placehold.co/400x400/f5f5f4/a3a3a3?text=Gem+${i + 1}`,
    stockId: `GR-${10000 + i}`,
    origin: "Brazil",
    certLab: "IGI",
    certNumber: `287329${300 + i}`,
    price: 1910 + i * 100,
    pricePerCarat: 1910.7,
    isExpress: i % 4 === 0,
    isReturnable: i % 3 !== 0,
    discount: i % 5 === 0 ? 25 : undefined,
    originalPrice: i % 5 === 0 ? 2548 : undefined,
    includeTariffs: true,
  }));
}

function gemstoneRenderGridItem(item: ReturnType<typeof generateGemstoneItems>[number]): GridItemData {
  return {
    id: item.id,
    name: item.name,
    thumbnailSrc: item.image,
    thumbnailAlt: item.name,
    lead: <span>{item.stockId}</span>,
    badges: [
      <Badge key="origin" variant="outline" size="sm">{item.origin}</Badge>,
      <Badge key="curated" variant="secondary" size="sm">Nivoda Curated</Badge>,
    ],
    categorySlotTop: (
      <div className="text-xs text-muted-foreground">
        Watermelon · Light color · 5.95 × 5.89 × 2.76mm
      </div>
    ),
    delivery: {
      estimatedDate: "Nov 18 – 23",
      shipsFrom: "United States",
      isExpress: item.isExpress,
    },
    returns: { isReturnable: item.isReturnable },
    pricing: {
      amount: item.price,
      currency: "USD",
      perCarat: { amount: item.pricePerCarat, currency: "USD" },
      discount: item.discount
        ? { percentage: item.discount, originalAmount: item.originalPrice! }
        : undefined,
      includeTariffs: item.includeTariffs,
    },
    onAddToCart: fn(),
    onFavorite: fn(),
    onShare: fn(),
    onViewMedia: fn(),
  };
}

// ── Stateful wrapper for interactive stories ──────────────

function PlpTemplateInteractive<TItem>({
  initialFilterState = {},
  ...props
}: Omit<PlpTemplateProps<TItem>, "filterState" | "onFilterChange" | "sortValue" | "onSortChange" | "page" | "onPageChange" | "pageSize" | "onPageSizeChange"> & {
  initialFilterState?: FilterState;
  sortValue: string;
  page: number;
  pageSize: number;
}) {
  const [filterState, setFilterState] = useState<FilterState>(initialFilterState);
  const [sortValue, setSortValue] = useState(props.sortValue);
  const [page, setPage] = useState(props.page);
  const [pageSize, setPageSize] = useState(props.pageSize);

  return (
    <PlpTemplate
      {...props}
      filterState={filterState}
      onFilterChange={(id, value) =>
        setFilterState((prev) => {
          const next = { ...prev };
          if (value === undefined) {
            delete next[id];
          } else {
            next[id] = value;
          }
          return next;
        })
      }
      sortValue={sortValue}
      onSortChange={setSortValue}
      page={page}
      onPageChange={setPage}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
    />
  );
}

// ── Story meta ────────────────────────────────────────────

const meta: Meta = {
  title: "Templates/PLP",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <PlpUserProvider>
        <AppShell>
          <AppShellHeader onSearch={fn()} />
          <AppShellMain>
            <Story />
          </AppShellMain>
        </AppShell>
      </PlpUserProvider>
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
      items={generateGemstoneItems(20)}
      renderGridItem={gemstoneRenderGridItem}
      page={1}
      pageSize={20}
      totalItems={1234567}
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
      sku: `SKU 100019ERDPL`,
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

    return (
      <PlpTemplateInteractive
        breadcrumbs={[{ label: "Jewelry", href: "#" }, { label: "Wedding rings" }]}
        title="Wedding rings"
        resultsCount={1234567}
        filters={jewelryFilters}
        filteredResultsCount={1234567}
        sortOptions={[{ value: "featured", label: "Featured" }, ...SORT_OPTIONS.slice(0, 2)]}
        sortValue="featured"
        items={items}
        renderGridItem={(item) => ({
          id: item.id,
          name: item.name,
          thumbnailSrc: item.image,
          thumbnailAlt: item.name,
          lead: <span>Wedding ring · {item.sku}</span>,
          delivery: { estimatedDate: "Nov 18 – 23", shipsFrom: "United States" },
          returns: { isReturnable: true },
          pricing: { amount: item.price, currency: "USD" },
          onAddToCart: fn(),
          onFavorite: fn(),
          onShare: fn(),
          onViewMedia: fn(),
          categorySlotBottom: (
            <div className="flex gap-1 mt-1">
              {["⚪", "🟡", "🔵", "⬛"].map((s, i) => (
                <span key={i} className="h-3 w-3 rounded-full border text-[8px] flex items-center justify-center">{s}</span>
              ))}
            </div>
          ),
        })}
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
      initialFilterState={{ color: ["blue", "green"], treatment: "heated" }}
      filteredResultsCount={342}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      items={generateGemstoneItems(20)}
      renderGridItem={gemstoneRenderGridItem}
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
        items={generateGemstoneItems(20)}
        renderGridItem={gemstoneRenderGridItem}
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
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      onSortChange={fn()}
      items={[]}
      renderGridItem={() => ({} as GridItemData)}
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
      items={[]}
      renderGridItem={() => ({} as GridItemData)}
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
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      onSortChange={fn()}
      items={[]}
      renderGridItem={() => ({} as GridItemData)}
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
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      onSortChange={fn()}
      items={[]}
      renderGridItem={() => ({} as GridItemData)}
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
