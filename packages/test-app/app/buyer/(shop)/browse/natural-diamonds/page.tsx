import {
  DIAMOND_FILTERS,
  fetchDiamondListFiltered,
} from "@/lib/api/diamonds";
import { parsePageListParams, type PageSearchParams } from "@/lib/api/filters";
import { formatUSD } from "@/lib/utils";
import { LayoutPlp } from "@/components/layouts/layout-plp/layout-plp";
import { ProductListItem } from "@/components/products/product-list-item";

import { NaturalDiamondsFilters } from "./filters";

export default async function NaturalDiamondsListPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const parsed = parsePageListParams(await searchParams, DIAMOND_FILTERS);
  const { items, totalItems } = await fetchDiamondListFiltered(
    parsed.filters,
    parsed.sort,
    parsed.pagination,
    false,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / parsed.pagination.perPage),
  );

  const breadcrumbs = [
    { label: "Natural diamonds", href: "/buyer/browse/natural-diamonds" },
  ];

  return (
    <LayoutPlp
      breadcrumbs={breadcrumbs}
      categoryName="Natural Diamonds"
      resultCount={totalItems}
      toolbar={<NaturalDiamondsFilters />}
      currentPage={parsed.pagination.page}
      totalPages={totalPages}
      perPage={parsed.pagination.perPage}
    >
      {items.map((item) => (
        <ProductListItem
          key={item.id}
          id={item.id}
          href={`/buyer/browse/natural-diamonds/${item.id}`}
          imageSrc={item.image}
          imageAlt={item.description}
          title={item.description}
          subtitle={`${item.certLab} ${item.certNumber} · ${item.stockId}`}
          priceLabel="Price"
          formattedPrice={formatUSD(item.price)}
          tags={
            item.certLab
              ? [
                  {
                    key: "cert",
                    label: item.certLab,
                    title: `Certified by ${item.certLab}`,
                  },
                ]
              : []
          }
        />
      ))}
    </LayoutPlp>
  );
}
