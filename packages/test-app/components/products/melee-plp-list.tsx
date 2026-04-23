"use client";

import Link from "next/link";
import { IconShoppingCartPlus } from "@tabler/icons-react";
import { Button, TableHead } from "@nivoda/components";
import {
  PlpListBodyCell,
  PlpListBodyRow,
  PlpListHeaderCell,
  PlpListHeaderRow,
  PlpListRowActions,
  PlpListRowDelivery,
  PlpListRowMedia,
  PlpListRowPrice,
  PlpListRowPricePerCarat,
  PlpListRowReturnable,
} from "@nivoda/components/components/templates/plp/list/plp-list-row";
import { toast } from "sonner";

import { useCartStore } from "@/hooks/use-cart-store";
import type { MeleeListItem } from "@/lib/api/melee";

import { getMockStockId, getPlpItemMock } from "./plp-item-mocks";

export function MeleePlpListHeader() {
  return (
    <PlpListHeaderRow>
      <PlpListHeaderCell hug>
        <span className="sr-only">Thumbnail</span>
      </PlpListHeaderCell>
      <TableHead>Name</TableHead>
      <TableHead>Shape</TableHead>
      <TableHead>Size range</TableHead>
      <TableHead>Color</TableHead>
      <TableHead>Clarity</TableHead>
      <TableHead className="text-center">Qty</TableHead>
      <TableHead className="text-end">Total ct</TableHead>
      <TableHead className="text-end">Price/ct</TableHead>
      <TableHead className="text-end">Total price</TableHead>
      <TableHead className="text-center">Ret</TableHead>
      <TableHead>Delivery</TableHead>
      <PlpListHeaderCell sticky="right">
        <span className="sr-only">Actions</span>
      </PlpListHeaderCell>
    </PlpListHeaderRow>
  );
}

export type MeleePlpListRowProps = {
  item: MeleeListItem;
  href: string;
  category: "natural_melee" | "lab_grown_melee";
};

export function MeleePlpListRow({ item, href, category }: MeleePlpListRowProps) {
  const mock = getPlpItemMock(item.id);
  const stockId = getMockStockId(item.id);
  const isInCart = useCartStore((s) =>
    s.items.some((i) => i.productId === item.id),
  );
  const addItem = useCartStore((s) => s.addItem);

  return (
    <PlpListBodyRow>
      <PlpListBodyCell hug>
        <PlpListRowMedia image={item.image} imageAlt={item.description} />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <Link
          href={href}
          className="font-medium hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {item.description}
        </Link>
      </PlpListBodyCell>
      <PlpListBodyCell>{item.shape}</PlpListBodyCell>
      <PlpListBodyCell>{item.sizeRange}</PlpListBodyCell>
      <PlpListBodyCell>{item.colorRange}</PlpListBodyCell>
      <PlpListBodyCell>{item.clarityRange}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">
        {item.quantity}
      </PlpListBodyCell>
      <PlpListBodyCell className="text-end">
        {item.totalCaratWeight.toFixed(2)}
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPricePerCarat amount={item.pricePerCarat} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPrice amount={item.totalPrice} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowReturnable
          variant={mock.isReturnable ? "returnable" : "non-returnable"}
        />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowDelivery
          variant={mock.isExpress ? "express" : "regular"}
          date={mock.deliveryDate}
          shipsFrom={mock.shipsFrom}
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
                name: item.description,
                certLab: null,
                certNumber: null,
                stockId,
                price: item.totalPrice,
                discount: null,
                image: item.image,
                category,
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
