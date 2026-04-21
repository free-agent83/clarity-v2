import { useState } from "react";
import { Typography } from "../../../atoms/typography/typography";
import {
  PlpGridItem,
  PlpGridItemDelivery,
  PlpGridItemMedia,
  PlpGridItemName,
  PlpGridItemPrice,
  PlpGridItemReturnable,
} from "../grid/plp-grid-item";
import {
  PlpListCell,
  PlpListHeaderCell,
  PlpListHeaderRow,
  PlpListRow,
  PlpListRowCheckbox,
  PlpListRowDelivery,
  PlpListRowMedia,
  PlpListRowName,
  PlpListRowPrice,
  PlpListRowReturnable,
} from "../list/plp-list-row";
import type { JewelryItem } from "./jewelry-items";

export function JewelryPlpGridItem({ item }: { item: JewelryItem }) {
  return (
    <PlpGridItem>
      <PlpGridItemMedia image={item.image} imageAlt={item.name} />
      <PlpGridItemName>{item.name}</PlpGridItemName>
      <Typography variant="caption" className="text-muted-foreground">
        Wedding ring · {item.sku}
      </Typography>
      <PlpGridItemDelivery
        variant="regular"
        date="Nov 18 – 23"
        shipsFrom={item.shipsFrom}
      />
      <PlpGridItemReturnable variant="returnable" />
      <PlpGridItemPrice amount={item.price} currency="USD" />
    </PlpGridItem>
  );
}

export function JewelryPlpListHeader() {
  return (
    <PlpListHeaderRow>
      <PlpListHeaderCell width={44}>
        <span className="sr-only">Select</span>
      </PlpListHeaderCell>
      <PlpListHeaderCell width={72}>
        <span className="sr-only">Thumbnail</span>
      </PlpListHeaderCell>
      <PlpListHeaderCell>Name</PlpListHeaderCell>
      <PlpListHeaderCell>SKU</PlpListHeaderCell>
      <PlpListHeaderCell>Delivery</PlpListHeaderCell>
      <PlpListHeaderCell>Returns</PlpListHeaderCell>
      <PlpListHeaderCell>Price</PlpListHeaderCell>
    </PlpListHeaderRow>
  );
}

export function JewelryPlpListRow({ item }: { item: JewelryItem }) {
  const [selected, setSelected] = useState(false);

  return (
    <PlpListRow selected={selected}>
      <PlpListCell>
        <PlpListRowCheckbox checked={selected} onChange={setSelected} />
      </PlpListCell>
      <PlpListCell>
        <PlpListRowMedia image={item.image} imageAlt={item.name} />
      </PlpListCell>
      <PlpListCell>
        <PlpListRowName>{item.name}</PlpListRowName>
      </PlpListCell>
      <PlpListCell>
        <span className="font-mono text-xs">{item.sku}</span>
      </PlpListCell>
      <PlpListCell>
        <PlpListRowDelivery
          variant="regular"
          date="Nov 18 – 23"
          shipsFrom={item.shipsFrom}
        />
      </PlpListCell>
      <PlpListCell>
        <PlpListRowReturnable variant="returnable" />
      </PlpListCell>
      <PlpListCell>
        <PlpListRowPrice amount={item.price} currency="USD" />
      </PlpListCell>
    </PlpListRow>
  );
}
