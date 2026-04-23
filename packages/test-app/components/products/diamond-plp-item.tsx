import Link from "next/link";
import { Typography } from "@nivoda/components";
import {
  PlpGridItem,
  PlpGridItemDelivery,
  PlpGridItemMedia,
  PlpGridItemName,
  PlpGridItemPrice,
  PlpGridItemPrimaryAction,
  PlpGridItemReturnable,
} from "@nivoda/components/components/templates/plp/grid/plp-grid-item";
import type { DiamondListItem } from "@/lib/api/diamonds";

import { AddToCartButton } from "./add-to-cart-button";
import { getMockStockId, getPlpItemMock } from "./plp-item-mocks";

export type DiamondPlpItemProps = {
  item: DiamondListItem;
  href: string;
  category: "natural_diamond" | "lab_grown_diamond";
};

export function DiamondPlpItem({ item, href, category }: DiamondPlpItemProps) {
  const mock = getPlpItemMock(item.id);
  const stockId = getMockStockId(item.id);
  const cert = [item.certLab, item.certNumber].filter(Boolean).join(" ");
  const captionParts = [cert, stockId].filter(Boolean);

  return (
    <PlpGridItem>
      <PlpGridItemMedia image={item.image} imageAlt={item.description} />

      <PlpGridItemName>
        <Link
          href={href}
          className="hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {item.description}
        </Link>
      </PlpGridItemName>

      <Typography variant="caption" className="text-muted-foreground">
        {captionParts.join(" · ")}
      </Typography>

      <Typography variant="caption" className="text-muted-foreground">
        {item.carat.toFixed(2)}ct · {item.shape} · {item.color} ·{" "}
        {item.clarity}
      </Typography>

      <PlpGridItemDelivery
        variant={mock.isExpress ? "express" : "regular"}
        date={mock.deliveryDate}
        shipsFrom={mock.shipsFrom}
      />

      <PlpGridItemReturnable
        variant={mock.isReturnable ? "returnable" : "non-returnable"}
      />

      <PlpGridItemPrice
        amount={item.price}
        currency="USD"
        perCarat={{ amount: item.pricePerCarat, currency: "USD" }}
      />

      <PlpGridItemPrimaryAction>
        <AddToCartButton
          product={{
            productId: item.id,
            name: item.description,
            certLab: item.certLab || null,
            certNumber: item.certNumber || null,
            stockId,
            price: item.price,
            discount: null,
            image: item.image,
            category,
            quantity: 1,
          }}
        />
      </PlpGridItemPrimaryAction>
    </PlpGridItem>
  );
}
