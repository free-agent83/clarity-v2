import { ProductListItem } from "@/components/products/product-list-item";
import type { SearchResultProduct } from "@/hooks/use-search";

type SearchSectionProductsProps = {
  subcategory: string;
  items: SearchResultProduct[];
};

export function SearchSectionProducts({
  subcategory,
  items,
}: SearchSectionProductsProps) {
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-xl font-medium leading-8 text-foreground">
        {subcategory} ({items.length})
      </h2>
      <div className="grid grid-cols-4 gap-x-5 gap-y-16">
        {items.map((item) => (
          <ProductListItem
            key={item.id}
            id={item.id}
            href={item.href}
            imageSrc={item.image}
            title={item.title}
            subtitle={item.subtitle}
            priceLabel={item.priceLabel}
            formattedPrice={item.formattedPrice}
          />
        ))}
      </div>
    </section>
  );
}
