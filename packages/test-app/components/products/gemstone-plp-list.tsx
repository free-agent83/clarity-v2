"use client";

import Link from "next/link";
import { IconShoppingCartPlus } from "@tabler/icons-react";
import { Badge, Button, TableHead } from "@nivoda/components";
import {
  PlpListBodyCell,
  PlpListBodyRow,
  PlpListHeaderCell,
  PlpListHeaderRow,
  PlpListRowActions,
  PlpListRowCert,
  PlpListRowDelivery,
  PlpListRowMedia,
  PlpListRowPrice,
  PlpListRowPricePerCarat,
  PlpListRowReturnable,
} from "@nivoda/components/components/templates/plp/list/plp-list-row";
import { toast } from "sonner";

import { useCartStore } from "@/hooks/use-cart-store";
import type { GemstoneListItem } from "@/lib/api/gemstones";

import { formatGemstoneDisplayName } from "./gemstone-name";
import { getMockStockId, getPlpItemMock } from "./plp-item-mocks";

export function GemstonePlpListHeader() {
  return (
    <PlpListHeaderRow>
      <PlpListHeaderCell hug>
        <span className="sr-only">Thumbnail</span>
      </PlpListHeaderCell>
      <TableHead>Name</TableHead>
      <TableHead>Type</TableHead>
      <TableHead>Shape</TableHead>
      <TableHead className="text-center">Ct</TableHead>
      <TableHead>Color</TableHead>
      <TableHead>Clarity</TableHead>
      <TableHead>Origin</TableHead>
      <TableHead>Cert</TableHead>
      <TableHead className="text-end">Price</TableHead>
      <TableHead className="text-end">Price/ct</TableHead>
      <TableHead className="text-center">Ret</TableHead>
      <TableHead>Delivery</TableHead>
      <PlpListHeaderCell sticky="right">
        <span className="sr-only">Actions</span>
      </PlpListHeaderCell>
    </PlpListHeaderRow>
  );
}

export type GemstonePlpListRowProps = {
  item: GemstoneListItem;
  href: string;
};

export function GemstonePlpListRow({ item, href }: GemstonePlpListRowProps) {
  const mock = getPlpItemMock(item.id);
  const stockId = getMockStockId(item.id);
  const displayName = formatGemstoneDisplayName(
    item.description,
    item.origin,
    item.treatment,
  );
  const isInCart = useCartStore((s) =>
    s.items.some((i) => i.productId === item.id),
  );
  const addItem = useCartStore((s) => s.addItem);

  return (
    <PlpListBodyRow>
      <PlpListBodyCell hug>
        <PlpListRowMedia image={item.image} imageAlt={displayName} />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <Link
          href={href}
          className="font-medium hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {displayName}
        </Link>
      </PlpListBodyCell>
      <PlpListBodyCell>
        <Badge variant="outline" size="sm">
          {item.type}
        </Badge>
      </PlpListBodyCell>
      <PlpListBodyCell>{item.shape}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">
        {item.carat.toFixed(2)}
      </PlpListBodyCell>
      <PlpListBodyCell>{item.color}</PlpListBodyCell>
      <PlpListBodyCell>{item.clarity}</PlpListBodyCell>
      <PlpListBodyCell>
        {item.origin || <span className="text-muted-foreground">—</span>}
      </PlpListBodyCell>
      <PlpListBodyCell>
        {item.certLab && item.certNumber ? (
          <PlpListRowCert lab={item.certLab} number={item.certNumber} />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPrice amount={item.price} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPricePerCarat amount={item.pricePerCarat} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowReturnable
          variant={mock.isReturnable ? "returnable" : "non-returnable"}
        />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowDelivery
          variant={mock.isExpress ? "express" : "regular"}
          businessDays={mock.businessDays}
          date={mock.deliveryDate}
          shipsFrom={item.origin || mock.shipsFrom}
        />
      </PlpListBodyCell>
      <PlpListBodyCell sticky="right">
        <PlpListRowActions>
          <Button
            size="sm"
            variant={isInCart ? "secondary" : "outline"}
            disabled={isInCart}
            onClick={(e) => {
              e.stopPropagation();
              addItem({
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
              });
              toast("Added to cart");
            }}
          >
            {isInCart ? "In cart" : "Add"}
            <IconShoppingCartPlus className="h-4 w-4" />
          </Button>
        </PlpListRowActions>
      </PlpListBodyCell>
    </PlpListBodyRow>
  );
}
