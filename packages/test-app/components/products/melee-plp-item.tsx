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
import type { MeleeListItem } from "@/lib/api/melee";

import { AddToCartButton } from "./add-to-cart-button";
import { getMockStockId, getPlpItemMock } from "./plp-item-mocks";

export type MeleePlpItemProps = {
  item: MeleeListItem;
  href: string;
  category: "natural_melee" | "lab_grown_melee";
};

export function MeleePlpItem({ item, href, category }: MeleePlpItemProps) {
  const mock = getPlpItemMock(item.id);
  const stockId = getMockStockId(item.id);

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
        {stockId}
      </Typography>

      <Typography variant="caption" className="text-muted-foreground">
        {item.shape} · {item.sizeRange} · {item.colorRange} ·{" "}
        {item.clarityRange} · {item.quantity}pcs
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
        amount={item.totalPrice}
        currency="USD"
        perCarat={{ amount: item.pricePerCarat, currency: "USD" }}
      />

      <PlpGridItemPrimaryAction>
        <AddToCartButton
          product={{
            productId: item.id,
            name: item.description,
            certLab: null,
            certNumber: null,
            stockId,
            price: item.totalPrice,
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
