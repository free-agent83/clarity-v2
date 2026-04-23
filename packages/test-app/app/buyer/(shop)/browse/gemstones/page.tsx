import { fetchGemstoneList } from "@/lib/api/gemstones";
import { formatUSD } from "@/lib/utils";
import {
  LayoutProductList,
  PER_PAGE_OPTIONS,
  DEFAULT_PER_PAGE,
  type SortOption,
} from "@/components/layouts/layout-product-list/layout-product-list";
import { ProductListItem } from "@/components/products/product-list-item";
import { UncontrolledFilterBar as FilterBar } from "@/components/filters/uncontrolled-filter-bar";

const FILTERS = [
  {
    key: "type",
    label: "Type",
    options: [
      "Ruby",
      "Sapphire",
      "Emerald",
      "Tanzanite",
      "Aquamarine",
      "Amethyst",
      "Tourmaline",
      "Spinel",
    ],
  },
  {
    key: "shape",
    label: "Shape",
    options: [
      "Round",
      "Oval",
      "Cushion",
      "Pear",
      "Emerald",
      "Marquise",
      "Heart",
    ],
  },
  {
    key: "color",
    label: "Color",
    options: [
      "Red",
      "Blue",
      "Green",
      "Purple",
      "Pink",
      "Yellow",
      "Orange",
      "Teal",
    ],
  },
  {
    key: "carat",
    label: "Carat",
    options: ["Under 1ct", "1–2ct", "2–5ct", "5–10ct", "10ct+"],
  },
  {
    key: "origin",
    label: "Origin",
    options: [
      "Burma",
      "Ceylon",
      "Colombia",
      "Madagascar",
      "Mozambique",
      "Thailand",
      "Untreated",
    ],
  },
  {
    key: "treatment",
    label: "Treatment",
    options: ["None", "Heat", "Beryllium", "Fracture filled", "Oiling"],
  },
];

const SORT_OPTIONS: SortOption[] = [
  { value: "featured", label: "Featured", displayLabel: "Featured" },
  { value: "price_asc", label: "Price: Low → High", displayLabel: "Price ↑" },
  { value: "price_desc", label: "Price: High → Low", displayLabel: "Price ↓" },
  { value: "newest", label: "Newest", displayLabel: "Newest" },
  { value: "carat", label: "Carat", displayLabel: "Carat" },
];

export default async function GemstonesListPage({
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
  } = await fetchGemstoneList({
    page: Number(params.page) || 1,
    perPage: Number(params.perPage) || DEFAULT_PER_PAGE,
    perPageOptions: PER_PAGE_OPTIONS,
  });

  const breadcrumbs = [{ label: "Gemstones", href: "/buyer/browse/gemstones" }];

  return (
    <LayoutProductList
      breadcrumbs={breadcrumbs}
      categoryName="Gemstones"
      resultCount={totalItems}
      quickFilters={<FilterBar filters={FILTERS} />}
      sortOptions={SORT_OPTIONS}
      currentPage={currentPage}
      totalPages={totalPages}
      perPage={perPage}
    >
      {paginatedItems.map((item) => (
        <ProductListItem
          key={item.id}
          id={item.id}
          href={`/buyer/browse/gemstones/${item.id}`}
          imageSrc={item.images.main}
          imageAlt={item.description}
          title={item.description}
          subtitle={`${item.certification.lab} ${item.certification.number} · ${item.stockId}`}
          priceLabel="Price"
          formattedPrice={formatUSD(item.price)}
          tags={[
            { key: "type", label: item.type, title: item.type },
            { key: "origin", label: item.origin, title: item.origin },
          ]}
        />
      ))}
    </LayoutProductList>
  );
}
