import { fetchGemstoneList } from "@/lib/api/gemstones";
import { formatUSD } from "@/lib/utils";
import {
  LayoutPlp,
  PER_PAGE_OPTIONS,
  DEFAULT_PER_PAGE,
} from "@/components/layouts/layout-plp/layout-plp";
import { ProductListItem } from "@/components/products/product-list-item";

import { GemstonesFilters } from "./filters";

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
    <LayoutPlp
      breadcrumbs={breadcrumbs}
      categoryName="Gemstones"
      resultCount={totalItems}
      toolbar={<GemstonesFilters />}
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
    </LayoutPlp>
  );
}
