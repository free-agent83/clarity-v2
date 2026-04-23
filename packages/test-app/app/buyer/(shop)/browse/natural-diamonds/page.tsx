import { fetchDiamondList } from "@/lib/api/diamonds";
import { formatUSD } from "@/lib/utils";
import {
  LayoutPlp,
  PER_PAGE_OPTIONS,
  DEFAULT_PER_PAGE,
  type SortOption,
} from "@/components/layouts/layout-plp/layout-plp";
import { ProductListItem } from "@/components/products/product-list-item";
import { UncontrolledFilterBar as FilterBar } from "@/components/filters/uncontrolled-filter-bar";

const FILTERS = [
  {
    key: "shape",
    label: "Shape",
    options: [
      "Round",
      "Oval",
      "Princess",
      "Cushion",
      "Emerald",
      "Pear",
      "Radiant",
      "Marquise",
      "Heart",
      "Asscher",
    ],
  },
  {
    key: "carat",
    label: "Carat",
    options: ["Under 0.5ct", "0.5–1ct", "1–2ct", "2–3ct", "3–5ct", "5ct+"],
  },
  {
    key: "color",
    label: "Color",
    options: ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"],
  },
  {
    key: "clarity",
    label: "Clarity",
    options: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"],
  },
  {
    key: "cut",
    label: "Cut",
    options: ["Excellent", "Very Good", "Good", "Fair", "Poor"],
  },
  {
    key: "certification",
    label: "Certification",
    options: ["GIA", "IGI", "HRD", "AGS", "None"],
  },
];

const SORT_OPTIONS: SortOption[] = [
  { value: "featured", label: "Featured", displayLabel: "Featured" },
  { value: "price_asc", label: "Price: Low → High", displayLabel: "Price ↑" },
  { value: "price_desc", label: "Price: High → Low", displayLabel: "Price ↓" },
  { value: "newest", label: "Newest", displayLabel: "Newest" },
  { value: "carat", label: "Carat", displayLabel: "Carat" },
];

export default async function NaturalDiamondsListPage({
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
  } = await fetchDiamondList({
    page: Number(params.page) || 1,
    perPage: Number(params.perPage) || DEFAULT_PER_PAGE,
    perPageOptions: PER_PAGE_OPTIONS,
  });

  const breadcrumbs = [
    { label: "Natural diamonds", href: "/buyer/browse/natural-diamonds" },
  ];

  return (
    <LayoutPlp
      breadcrumbs={breadcrumbs}
      categoryName="Natural Diamonds"
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
          href={`/buyer/browse/natural-diamonds/${item.id}`}
          imageSrc={item.images.main}
          imageAlt={item.description}
          title={item.description}
          subtitle={`${item.certification.lab} ${item.certification.number} · ${item.stockId}`}
          priceLabel="Price"
          formattedPrice={formatUSD(item.price)}
          tags={[
            {
              key: "cert",
              label: item.certification.lab,
              title: `Certified by ${item.certification.lab}`,
            },
          ]}
        />
      ))}
    </LayoutPlp>
  );
}
