"use client";

import Link from "next/link";
import { IconShoppingCartPlus } from "@tabler/icons-react";
import { TableHead } from "@nivoda/components";
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
import { Button } from "@nivoda/components";
import { toast } from "sonner";

import { useCartStore } from "@/hooks/use-cart-store";
import type { DiamondListItem } from "@/lib/api/diamonds";

import { getMockStockId, getPlpItemMock } from "./plp-item-mocks";

export function DiamondPlpListHeader() {
  return (
    <PlpListHeaderRow>
      <PlpListHeaderCell hug>
        <span className="sr-only">Thumbnail</span>
      </PlpListHeaderCell>
      <TableHead>Name</TableHead>
      <TableHead>Shape</TableHead>
      <TableHead className="text-center">Ct</TableHead>
      <TableHead className="text-center">Col</TableHead>
      <TableHead className="text-center">Cla</TableHead>
      <TableHead className="text-center">Cut</TableHead>
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

export type DiamondPlpListRowProps = {
  item: DiamondListItem;
  href: string;
  category: "natural_diamond" | "lab_grown_diamond";
};

export function DiamondPlpListRow({
  item,
  href,
  category,
}: DiamondPlpListRowProps) {
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
      <PlpListBodyCell className="text-center">
        {item.carat.toFixed(2)}
      </PlpListBodyCell>
      <PlpListBodyCell className="text-center">{item.color}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">{item.clarity}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">{item.cut}</PlpListBodyCell>
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
                certLab: item.certLab || null,
                certNumber: item.certNumber || null,
                stockId,
                price: item.price,
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
