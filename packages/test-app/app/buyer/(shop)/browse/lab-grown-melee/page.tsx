import { fetchMeleeList } from "@/lib/api/melee";
import { formatUSD } from "@/lib/utils";
import {
  LayoutPlp,
  PER_PAGE_OPTIONS,
  DEFAULT_PER_PAGE,
} from "@/components/layouts/layout-plp/layout-plp";
import { ProductListItem } from "@/components/products/product-list-item";

import { LabGrownMeleeFilters } from "./filters";

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
      toolbar={<LabGrownMeleeFilters />}
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
