import {
  GEMSTONE_FILTERS,
  fetchGemstoneListFiltered,
} from "@/lib/api/gemstones";
import { parsePageListParams, type PageSearchParams } from "@/lib/api/filters";
import { formatUSD } from "@/lib/utils";
import { LayoutPlp } from "@/components/layouts/layout-plp/layout-plp";
import { ProductListItem } from "@/components/products/product-list-item";

import { GemstonesFilters } from "./filters";

export default async function GemstonesListPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const parsed = parsePageListParams(await searchParams, GEMSTONE_FILTERS);
  const { items, totalItems } = await fetchGemstoneListFiltered(
    parsed.filters,
    parsed.sort,
    parsed.pagination,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / parsed.pagination.perPage),
  );

  const breadcrumbs = [{ label: "Gemstones", href: "/buyer/browse/gemstones" }];

  return (
    <LayoutPlp
      breadcrumbs={breadcrumbs}
      categoryName="Gemstones"
      resultCount={totalItems}
      toolbar={<GemstonesFilters />}
      currentPage={parsed.pagination.page}
      totalPages={totalPages}
      perPage={parsed.pagination.perPage}
    >
      {items.map((item) => (
        <ProductListItem
          key={item.id}
          id={item.id}
          href={`/buyer/browse/gemstones/${item.id}`}
          imageSrc={item.image}
          imageAlt={item.description}
          title={item.description}
          subtitle={`${item.certLab} ${item.certNumber} · ${item.stockId}`}
          priceLabel="Price"
          formattedPrice={formatUSD(item.price)}
          tags={[
            { key: "type", label: item.type, title: item.type },
            ...(item.origin
              ? [{ key: "origin", label: item.origin, title: item.origin }]
              : []),
          ]}
        />
      ))}
    </LayoutPlp>
  );
}
