import { fetchMeleeList } from "@/lib/api/melee";
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
    options: ["Round", "Princess", "Baguette", "Tapered baguette"],
  },
  {
    key: "size",
    label: "Size",
    options: ["Under 1mm", "1–1.5mm", "1.5–2mm", "2–2.5mm", "2.5–3mm", "3mm+"],
  },
  {
    key: "color_range",
    label: "Color range",
    options: ["DEF", "GHI", "JKL", "MNO"],
  },
  {
    key: "clarity_range",
    label: "Clarity range",
    options: ["VVS", "VS", "SI", "I"],
  },
  {
    key: "cut",
    label: "Cut",
    options: ["Excellent", "Very Good", "Good"],
  },
];

const SORT_OPTIONS: SortOption[] = [
  { value: "featured", label: "Featured", displayLabel: "Featured" },
  { value: "price_asc", label: "Price: Low → High", displayLabel: "Price ↑" },
  { value: "price_desc", label: "Price: High → Low", displayLabel: "Price ↓" },
  { value: "newest", label: "Newest", displayLabel: "Newest" },
  { value: "carat", label: "Carat", displayLabel: "Carat" },
];

export default async function LabGrownMeleeListPage({
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
  } = await fetchMeleeList(
    {
      page: Number(params.page) || 1,
      perPage: Number(params.perPage) || DEFAULT_PER_PAGE,
      perPageOptions: PER_PAGE_OPTIONS,
    },
    true,
  );

  const breadcrumbs = [
    { label: "Lab-grown melee", href: "/buyer/browse/lab-grown-melee" },
  ];

  return (
    <LayoutPlp
      breadcrumbs={breadcrumbs}
      categoryName="Lab Grown Melee"
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
          href={`/buyer/browse/lab-grown-melee/${item.id}`}
          imageSrc={item.images.main}
          imageAlt={item.description}
          title={item.description}
          subtitle={item.stockId}
          priceLabel="Total price"
          formattedPrice={formatUSD(item.totalPrice)}
          tags={[
            { key: "size", label: item.sizeRange },
            { key: "qty", label: `${item.quantity}pcs` },
          ]}
        />
      ))}
    </LayoutPlp>
  );
}
