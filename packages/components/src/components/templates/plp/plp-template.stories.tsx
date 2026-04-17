import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useRef, useState } from "react";
import { PlpTemplate, type PlpTemplateProps } from "./plp-template";
import { PlpUserProvider } from "./context/plp-user-context";
import {
  AppShell,
  AppShellHeader,
  AppShellActions,
  AppShellMain,
} from "../../organisms/app-shell/app-shell";
import { Badge } from "../../atoms/badge/badge";
import type {
  FilterDefinition,
  FilterState,
  GridItemData,
  ListColumn,
  PlpViewMode,
  SortOption,
} from "./plp-types";

// ── Shared mock data ──────────────────────────────────────

// -- Shared mock helpers for advanced filter presets ----------------------

function buildMockHistogram(
  min: number,
  max: number,
  bucketCount: number,
  peakAt: number
): { buckets: number[]; min: number; max: number } {
  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const bucketCenter = min + ((i + 0.5) * (max - min)) / bucketCount;
    const distanceFromPeak = Math.abs(bucketCenter - peakAt);
    const peakWidth = (max - min) / 4;
    const normalized = Math.max(0, 1 - distanceFromPeak / peakWidth);
    return Math.round(normalized * 40 + Math.random() * 10);
  });
  return { buckets, min, max };
}

const MOCK_SUPPLIERS: { value: string; label: string }[] = [
  { value: "sup-acme", label: "Acme Gem Traders" },
  { value: "sup-globex", label: "Globex Mining Co." },
  { value: "sup-initech", label: "Initech Stones" },
  { value: "sup-umbrella", label: "Umbrella Gemstones Ltd." },
  { value: "sup-hooli", label: "Hooli Premium" },
  { value: "sup-pied", label: "Pied Piper Rough" },
  { value: "sup-stark", label: "Stark Industries Jewellery" },
  { value: "sup-wayne", label: "Wayne Enterprises Minerals" },
  { value: "sup-cyberdyne", label: "Cyberdyne Gems" },
  { value: "sup-tyrell", label: "Tyrell Heritage Stones" },
];

// Sample 360 rotation video — used for ~1/3 of mock items in PLP stories.
// If this URL becomes unavailable, swap for another small public MP4.
const SAMPLE_360_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

async function mockSupplierSearch(query: string) {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));
  const q = query.toLowerCase();
  return MOCK_SUPPLIERS.filter((s) => s.label.toLowerCase().includes(q));
}

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
  {
    id: "price",
    label: "Price",
    preset: "range-slider",
    isQuickFilter: true,
    min: 0,
    max: 10000,
    step: 10,
    unit: "$",
    histogram: buildMockHistogram(0, 10000, 40, 2500),
  },
  {
    id: "carat",
    label: "Carat",
    preset: "range-slider",
    min: 0,
    max: 10,
    step: 0.1,
    unit: "ct",
    histogram: buildMockHistogram(0, 10, 40, 2),
  },
  {
    id: "size",
    label: "Size (mm)",
    preset: "multi-axis-range",
    axes: [
      { id: "length", label: "Length", min: 0, max: 20, step: 0.1, unit: "mm" },
      { id: "width", label: "Width", min: 0, max: 20, step: 0.1, unit: "mm" },
      { id: "depth", label: "Depth", min: 0, max: 10, step: 0.1, unit: "mm" },
    ],
  },
  {
    id: "supplier",
    label: "Supplier",
    preset: "async-combobox",
    searchFn: mockSupplierSearch,
    searchPlaceholder: "Search suppliers...",
  },
];

// Pre-seed supplier options for stories that start with a value set
const _gemstoneSupplier = GEMSTONE_FILTERS.find((f) => f.id === "supplier");
if (_gemstoneSupplier && _gemstoneSupplier.preset === "async-combobox") {
  _gemstoneSupplier.options = MOCK_SUPPLIERS.filter((s) =>
    ["sup-acme", "sup-globex", "sup-initech"].includes(s.value)
  );
}

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
    media360:
      Number.parseInt(item.id.replace(/\D/g, ""), 10) % 3 === 0
        ? { videoUrl: SAMPLE_360_VIDEO_URL }
        : undefined,
    onAddToCart: fn(),
    onFavorite: fn(),
    onShare: fn(),
    onViewMedia: fn(),
  };
}

// -- Diamond mock data (list view) -----------------------------------------

interface DiamondItem {
  id: string;
  name: string;
  image: string;
  stockId: string;
  carat: number;
  color: string;
  clarity: string;
  shape: string;
  origin: string;
  certLab: string;
  certNumber: string;
  price: number;
  pricePerCarat: number;
  isExpress: boolean;
  isReturnable: boolean;
}

function generateDiamondItems(count: number): DiamondItem[] {
  const shapes = ["Round", "Oval", "Cushion", "Princess", "Pear", "Emerald"];
  const colors = ["D", "E", "F", "G", "H", "I"];
  const clarities = ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1"];
  const origins = ["Botswana", "Russia", "Canada", "Australia", "South Africa"];
  const labs = ["GIA", "IGI", "AGS"];

  return Array.from({ length: count }, (_, i) => ({
    id: `diamond-${i}`,
    name: `${(0.5 + i * 0.1).toFixed(2)}ct ${shapes[i % shapes.length]} Diamond`,
    image: `https://placehold.co/400x400/f5f5f4/a3a3a3?text=Diamond+${i + 1}`,
    stockId: `DM-${10000 + i}`,
    carat: Number((0.5 + i * 0.1).toFixed(2)),
    color: colors[i % colors.length],
    clarity: clarities[i % clarities.length],
    shape: shapes[i % shapes.length],
    origin: origins[i % origins.length],
    certLab: labs[i % labs.length],
    certNumber: `${287329000 + i}`,
    price: 2500 + i * 350,
    pricePerCarat: 5000 + i * 100,
    isExpress: i % 5 === 0,
    isReturnable: i % 3 !== 0,
  }));
}

function diamondRenderGridItem(item: DiamondItem): GridItemData {
  return {
    id: item.id,
    name: item.name,
    thumbnailSrc: item.image,
    thumbnailAlt: item.name,
    lead: <span>{item.stockId}</span>,
    badges: [],
    delivery: {
      estimatedDate: "Nov 18 – 23",
      shipsFrom: item.origin,
      isExpress: item.isExpress,
    },
    returns: { isReturnable: item.isReturnable },
    pricing: {
      amount: item.price,
      currency: "USD",
      perCarat: { amount: item.pricePerCarat, currency: "USD" },
    },
    media360:
      Number.parseInt(item.id.replace(/\D/g, ""), 10) % 3 === 0
        ? { videoUrl: SAMPLE_360_VIDEO_URL }
        : undefined,
    onAddToCart: fn(),
    onFavorite: fn(),
    onShare: fn(),
    onViewMedia: fn(),
  };
}

const DIAMOND_FILTERS: FilterDefinition[] = [
  {
    id: "shape",
    label: "Shape",
    preset: "multi-select-chips",
    isQuickFilter: true,
    options: [
      { value: "round", label: "Round" },
      { value: "oval", label: "Oval" },
      { value: "cushion", label: "Cushion" },
      { value: "princess", label: "Princess" },
    ],
  },
  {
    id: "color",
    label: "Color",
    preset: "multi-select-chips",
    isQuickFilter: true,
    options: ["D", "E", "F", "G", "H", "I"].map((c) => ({ value: c, label: c })),
  },
  {
    id: "clarity",
    label: "Clarity",
    preset: "multi-select-chips",
    options: ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1"].map((c) => ({
      value: c,
      label: c,
    })),
  },
  {
    id: "price",
    label: "Price",
    preset: "range-slider",
    isQuickFilter: true,
    min: 0,
    max: 10000,
    step: 10,
    unit: "$",
    histogram: buildMockHistogram(0, 10000, 40, 2500),
  },
  {
    id: "carat",
    label: "Carat",
    preset: "range-slider",
    min: 0,
    max: 10,
    step: 0.1,
    unit: "ct",
    histogram: buildMockHistogram(0, 10, 40, 2),
  },
  {
    id: "size",
    label: "Size (mm)",
    preset: "multi-axis-range",
    axes: [
      { id: "length", label: "Length", min: 0, max: 20, step: 0.1, unit: "mm" },
      { id: "width", label: "Width", min: 0, max: 20, step: 0.1, unit: "mm" },
      { id: "depth", label: "Depth", min: 0, max: 10, step: 0.1, unit: "mm" },
    ],
  },
  {
    id: "supplier",
    label: "Supplier",
    preset: "async-combobox",
    searchFn: mockSupplierSearch,
    searchPlaceholder: "Search suppliers...",
  },
];

const DIAMOND_LIST_COLUMNS: ListColumn<DiamondItem>[] = [
  {
    id: "carat",
    header: "Carat",
    cell: (item) => item.carat.toFixed(2),
    align: "right",
  },
  {
    id: "shape",
    header: "Shape",
    cell: (item) => item.shape,
  },
  {
    id: "color",
    header: "Color",
    cell: (item) => item.color,
    align: "center",
  },
  {
    id: "clarity",
    header: "Clarity",
    cell: (item) => item.clarity,
    align: "center",
  },
  {
    id: "origin",
    header: "Origin",
    cell: (item) => item.origin,
  },
  {
    id: "cert",
    header: "Certificate",
    cell: (item) => (
      <span className="font-mono text-xs">
        {item.certLab} {item.certNumber}
      </span>
    ),
  },
];

// ── Stateful wrapper for interactive stories ──────────────

/**
 * Mock preview-count fetcher for stories. Simulates a backend call that
 * returns a count derived from the current filter state. Debounced by
 * the caller via `setTimeout`-based delay.
 */
async function mockPreviewCount(draftState: FilterState): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  // Arbitrary formula: start from a big number and divide by (active filter count + 1).
  const activeCount = Object.values(draftState).filter(
    (v) => v !== undefined
  ).length;
  return Math.max(1, Math.round(1_234_567 / (activeCount * 3 + 1)));
}

function PlpTemplateInteractive<TItem>({
  initialFilterState = {},
  initialViewMode = "grid",
  ...props
}: Omit<
  PlpTemplateProps<TItem>,
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
  status?: PlpTemplateProps<TItem>["status"];
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
    useState<PlpTemplateProps<TItem>["status"]>(baselineStatus);

  // Debounced preview-count fetcher — consumer-side concern in real apps;
  // here we keep it inline so stories are self-contained. Sets
  // `isCountLoading` while a fetch is in flight so the drawer's primary
  // action shows a spinner.
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

  // Simulate a backend roundtrip after any applied filter change
  // (quick filter, active chip edit, drawer apply). Flips `status` to
  // "loading" for ~600ms so the grid/list shows its skeleton, then
  // restores the baseline status. Only active when baseline is
  // "success" — other states (empty, error) are left alone.
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function simulateBackendCommit() {
    if (baselineStatus !== "success") return;
    setEffectiveStatus("loading");
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    statusTimerRef.current = setTimeout(() => {
      setEffectiveStatus(baselineStatus);
    }, 600);
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
      initialFilterState={{
        color: ["blue", "green"],
        treatment: "heated",
        price: { min: 1000, max: 5000 },
        supplier: ["sup-acme", "sup-globex", "sup-initech"],
      }}
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
      onDraftFilterStateChange={fn()}
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
      onDraftFilterStateChange={fn()}
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
      onDraftFilterStateChange={fn()}
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

export const DiamondListView: StoryObj = {
  render: () => (
    <PlpTemplateInteractive
      breadcrumbs={[{ label: "Diamonds", href: "#" }, { label: "Natural" }]}
      title="Natural Diamonds"
      resultsCount={48291}
      filters={DIAMOND_FILTERS}
      filteredResultsCount={48291}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      items={generateDiamondItems(20)}
      renderGridItem={diamondRenderGridItem}
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
  render: () => {
    const gemstoneListColumns: ListColumn<ReturnType<typeof generateGemstoneItems>[number]>[] = [
      { id: "stockId", header: "Stock ID", cell: (item) => <span className="font-mono text-xs">{item.stockId}</span> },
      { id: "origin", header: "Origin", cell: (item) => item.origin },
      { id: "cert", header: "Certificate", cell: (item) => (
        <span className="font-mono text-xs">{item.certLab} {item.certNumber}</span>
      ) },
    ];

    return (
      <PlpTemplateInteractive
        breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
        title="Sapphire"
        resultsCount={1234567}
        filters={GEMSTONE_FILTERS}
        filteredResultsCount={10234}
        sortOptions={SORT_OPTIONS}
        sortValue="price-asc"
        items={generateGemstoneItems(20)}
        renderGridItem={gemstoneRenderGridItem}
        listColumns={gemstoneListColumns}
        initialViewMode="list"
        onItemClick={fn()}
        page={1}
        pageSize={20}
        totalItems={1234567}
        status="success"
        onRetry={fn()}
      />
    );
  },
};
