import { MELEE_FILTERS, fetchMeleeListFiltered } from "@/lib/api/melee";
import { parsePageListParams, type PageSearchParams } from "@/lib/api/filters";
import { formatUSD } from "@/lib/utils";
import { LayoutPlp } from "@/components/layouts/layout-plp/layout-plp";
import { ProductListItem } from "@/components/products/product-list-item";

import { LabGrownMeleeFilters } from "./filters";

export default async function LabGrownMeleeListPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const parsed = parsePageListParams(await searchParams, MELEE_FILTERS);
  const { items, totalItems } = await fetchMeleeListFiltered(
    parsed.filters,
    parsed.sort,
    parsed.pagination,
    true,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / parsed.pagination.perPage),
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
      currentPage={parsed.pagination.page}
      totalPages={totalPages}
      perPage={parsed.pagination.perPage}
    >
      {items.map((item) => (
        <ProductListItem
          key={item.id}
          id={item.id}
          href={`/buyer/browse/lab-grown-melee/${item.id}`}
          imageSrc={item.image}
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
