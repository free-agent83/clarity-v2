import Link from "next/link";
import { Badge, Typography } from "@nivoda/components";
import {
  PlpGridItem,
  PlpGridItemDelivery,
  PlpGridItemMedia,
  PlpGridItemName,
  PlpGridItemPrice,
  PlpGridItemPrimaryAction,
  PlpGridItemReturnable,
} from "@nivoda/components/components/templates/plp/grid/plp-grid-item";
import type { GemstoneListItem } from "@/lib/api/gemstones";

import { AddToCartButton } from "./add-to-cart-button";
import { formatGemstoneDisplayName } from "./gemstone-name";
import { getMockStockId, getPlpItemMock } from "./plp-item-mocks";

export type GemstonePlpItemProps = {
  item: GemstoneListItem;
  href: string;
};

export function GemstonePlpItem({ item, href }: GemstonePlpItemProps) {
  const mock = getPlpItemMock(item.id);
  const stockId = getMockStockId(item.id);
  const cert = [item.certLab, item.certNumber].filter(Boolean).join(" ");
  const captionParts = [cert, stockId].filter(Boolean);
  const displayName = formatGemstoneDisplayName(
    item.description,
    item.origin,
    item.treatment,
  );

  return (
    <PlpGridItem>
      <PlpGridItemMedia image={item.image} imageAlt={displayName} />

      <PlpGridItemName>
        <Link
          href={href}
          className="hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {displayName}
        </Link>
      </PlpGridItemName>

      <Typography variant="caption" className="text-muted-foreground">
        {captionParts.join(" · ")}
      </Typography>

      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" size="sm">
          {item.type}
        </Badge>
        {item.origin && (
          <Badge variant="outline" size="sm">
            {item.origin}
          </Badge>
        )}
      </div>

      <Typography variant="caption" className="text-muted-foreground">
        {item.carat.toFixed(2)}ct · {item.shape} · {item.color} ·{" "}
        {item.clarity}
      </Typography>

      <PlpGridItemDelivery
        variant={mock.isExpress ? "express" : "regular"}
        date={mock.deliveryDate}
        shipsFrom={item.origin || mock.shipsFrom}
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
            name: displayName,
            certLab: item.certLab || null,
            certNumber: item.certNumber || null,
            stockId,
            price: item.price,
            discount: null,
            image: item.image,
            category: "gemstone",
            quantity: 1,
          }}
        />
      </PlpGridItemPrimaryAction>
    </PlpGridItem>
  );
}
