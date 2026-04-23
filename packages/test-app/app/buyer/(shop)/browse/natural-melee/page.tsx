import { fetchMeleeList } from "@/lib/api/melee";
import { formatUSD } from "@/lib/utils";
import {
  LayoutPlp,
  PER_PAGE_OPTIONS,
  DEFAULT_PER_PAGE,
} from "@/components/layouts/layout-plp/layout-plp";
import { ProductListItem } from "@/components/products/product-list-item";

import { NaturalMeleeFilters } from "./filters";

export default async function NaturalMeleeListPage({
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
    false,
  );

  const breadcrumbs = [
    { label: "Natural melee", href: "/buyer/browse/natural-melee" },
  ];

  return (
    <LayoutPlp
      breadcrumbs={breadcrumbs}
      categoryName="Natural Melee"
      resultCount={totalItems}
      toolbar={<NaturalMeleeFilters />}
      currentPage={currentPage}
      totalPages={totalPages}
      perPage={perPage}
    >
      {paginatedItems.map((item) => (
        <ProductListItem
          key={item.id}
          id={item.id}
          href={`/buyer/browse/natural-melee/${item.id}`}
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
