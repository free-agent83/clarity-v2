import {
  fetchEngagementRingList,
  type EngagementRingItem,
} from "@/lib/api/jewelry";
import { formatUSD } from "@/lib/utils";
import {
  LayoutPlp,
  PER_PAGE_OPTIONS,
  DEFAULT_PER_PAGE,
  type SortOption,
} from "@/components/layouts/layout-plp/layout-plp";
import { ProductListItem } from "@/components/products/product-list-item";
import { UncontrolledFilterBar as FilterBar } from "@/components/filters/uncontrolled-filter-bar";

const METAL_SWATCH_COLORS: Record<string, string> = {
  "14k_yellow_gold": "#e6c24b",
  "18k_yellow_gold": "#e6c24b",
  "14k_rose_gold": "#e8b4a8",
  "18k_rose_gold": "#e8b4a8",
  "10k_white_gold": "#e0e0e0",
  "14k_white_gold": "#e0e0e0",
  "18k_white_gold": "#e0e0e0",
  "950_platinum": "#9ba0a8",
};

function getMetalSwatches(
  item: EngagementRingItem,
): { value: string; swatch: string }[] {
  const seen = new Set<string>();
  const swatches: { value: string; swatch: string }[] = [];
  for (const am of item.availableMetals) {
    const metalValue = am.metal.value;
    if (!seen.has(metalValue) && METAL_SWATCH_COLORS[metalValue]) {
      seen.add(metalValue);
      swatches.push({
        value: metalValue,
        swatch: METAL_SWATCH_COLORS[metalValue],
      });
    }
  }
  return swatches;
}

const FILTERS = [
  {
    key: "stone_shape",
    label: "Stone shape",
    options: [
      "Round",
      "Oval",
      "Princess",
      "Cushion",
      "Emerald",
      "Pear",
      "Radiant",
      "Marquise",
    ],
  },
  {
    key: "stone_count",
    label: "Stone count",
    options: ["Solitaire", "3-stone", "Halo", "Pavé", "Channel"],
  },
  {
    key: "metal",
    label: "Metal",
    options: [
      "14k Yellow Gold",
      "18k Yellow Gold",
      "14k Rose Gold",
      "18k Rose Gold",
      "14k White Gold",
      "18k White Gold",
      "950 Platinum",
    ],
  },
  {
    key: "style",
    label: "Style",
    options: ["Classic", "Vintage", "Modern", "Nature-inspired", "Bezel"],
  },
];

const SORT_OPTIONS: SortOption[] = [
  { value: "featured", label: "Featured", displayLabel: "Featured" },
  { value: "price_asc", label: "Price: Low → High", displayLabel: "Price ↑" },
  { value: "price_desc", label: "Price: High → Low", displayLabel: "Price ↓" },
  { value: "newest", label: "Newest", displayLabel: "Newest" },
];

export default async function JewelryListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const params = await searchParams;

  const {
    items: paginatedItems,
    totalItems,
    totalPages,
    currentPage,
    perPage,
  } = await fetchEngagementRingList({
    page: Number(params.page) || 1,
    perPage: Number(params.perPage) || DEFAULT_PER_PAGE,
    perPageOptions: PER_PAGE_OPTIONS,
  });

  const breadcrumbs = [
    { label: "Jewellery", href: "/buyer/browse/jewelry" },
    {
      label: "Engagement rings",
      href: "/buyer/browse/jewelry/engagement-rings",
    },
  ];

  return (
    <LayoutPlp
      breadcrumbs={breadcrumbs}
      categoryName="Engagement Rings"
      resultCount={totalItems}
      quickFilters={<FilterBar filters={FILTERS} />}
      sortOptions={SORT_OPTIONS}
      currentPage={currentPage}
      totalPages={totalPages}
      perPage={perPage}
    >
      {paginatedItems.map((item) => {
        const metals = getMetalSwatches(item);
        const stoneShapes = item.compatibleStones.map((cs) => cs.shape);
        // Use the minimum available metal price as the starting price
        const minPrice =
          item.availableMetals.length > 0
            ? Math.min(...item.availableMetals.map((am) => am.priceUsd))
            : 0;

        const thumbnail =
          item.images.find((img) => img.isThumbnail)?.url ??
          item.images[0]?.url ??
          "";

        return (
          <ProductListItem
            key={item.id}
            id={item.id}
            href={`/buyer/browse/jewelry/engagement-rings/${item.id}`}
            imageSrc={thumbnail}
            imageAlt={item.description}
            title={item.description}
            subtitle={`${item.bandStyle.value} · SKU ${item.sku}`}
            priceLabel="Starting from"
            formattedPrice={formatUSD(minPrice)}
            tags={stoneShapes.map((s: { id: string; value: string }) => ({
              key: s.id,
              label: s.value.charAt(0),
              title: s.value,
            }))}
            swatches={metals.map((m) => ({
              key: m.value,
              hex: m.swatch,
              title: m.value,
            }))}
          />
        );
      })}
    </LayoutPlp>
  );
}
