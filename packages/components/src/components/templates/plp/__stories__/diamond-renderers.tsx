import { useState } from "react";
import {
  IconDotsVertical,
  IconHeart,
  IconPhoto,
  IconShare,
  IconShoppingCart,
} from "@tabler/icons-react";
import { Badge } from "../../../atoms/badge/badge";
import { Button } from "../../../atoms/button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../molecules/dropdown-menu/dropdown-menu";
import { Typography } from "../../../atoms/typography/typography";
import {
  PlpGridItem,
  PlpGridItemMedia,
  PlpGridItemMediaAction,
  PlpGridItemMediaToolbar,
  PlpGridItemName,
  PlpGridItemDelivery,
  PlpGridItemReturnable,
  PlpGridItemPrice,
  PlpGridItemPrimaryAction,
} from "../grid/plp-grid-item";
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
} from "../list/plp-list-row";
import { TableHead } from "../../../organisms/table/table";
import { useStorybookAppUser } from "../../../../../.storybook/app-user-context";
import { SAMPLE_360_VIDEO_URL } from "./sort-options";
import type { DiamondItem } from "./diamond-items";

const noop = () => {};

const REGULAR_BUSINESS_DAYS = ["2 – 3", "3 – 5", "4 – 6"];

function getBusinessDays(item: DiamondItem): string {
  if (item.isExpress) return "1 – 2";
  const idx = Number.parseInt(item.id.replace(/\D/g, ""), 10);
  return REGULAR_BUSINESS_DAYS[idx % REGULAR_BUSINESS_DAYS.length];
}

export function DiamondPlpGridItem({ item }: { item: DiamondItem }) {
  const userContext = useStorybookAppUser();

  const itemIndex = Number.parseInt(item.id.replace(/\D/g, ""), 10);
  const video = itemIndex % 3 === 0 ? SAMPLE_360_VIDEO_URL : undefined;
  const businessDays = getBusinessDays(item);

  const alternateCurrency =
    userContext.currency !== "USD"
      ? { amount: item.price, currency: userContext.currency }
      : undefined;

  return (
    <PlpGridItem>
      <PlpGridItemMedia image={item.image} imageAlt={item.name} video={video}>
        <PlpGridItemMediaToolbar>
          <PlpGridItemMediaAction
            icon={IconHeart}
            label="Add to shortlist"
            onClick={noop}
          />
          <PlpGridItemMediaAction icon={IconShare} label="Share" onClick={noop} />
          <PlpGridItemMediaAction
            icon={IconPhoto}
            label="View media"
            onClick={noop}
          />
        </PlpGridItemMediaToolbar>
      </PlpGridItemMedia>

      <PlpGridItemName>{item.name}</PlpGridItemName>

      <Typography variant="caption" className="text-muted-foreground">
        {item.certLab} {item.certNumber}
      </Typography>

      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" size="sm">
          {item.origin}
        </Badge>
      </div>

      <Typography variant="caption" className="text-muted-foreground">
        {item.carat.toFixed(2)}ct · {item.shape} · {item.color} · {item.clarity}
      </Typography>

      <PlpGridItemDelivery
        variant={item.isExpress ? "express" : "regular"}
        businessDays={businessDays}
        date="Nov 18 – 23"
        shipsFrom={item.origin}
      />

      <PlpGridItemReturnable
        variant={item.isReturnable ? "returnable" : "non-returnable"}
      />

      <PlpGridItemPrice
        amount={item.price}
        currency="USD"
        perCarat={{ amount: item.pricePerCarat, currency: "USD" }}
        alternateCurrency={alternateCurrency}
      />

      <PlpGridItemPrimaryAction>
        <Button className="w-full" onClick={noop}>
          Add to cart
        </Button>
      </PlpGridItemPrimaryAction>
    </PlpGridItem>
  );
}

export function DiamondPlpListHeader() {
  return (
    <PlpListHeaderRow>
      <PlpListHeaderCell hug>
        <span className="sr-only">Select</span>
      </PlpListHeaderCell>
      <PlpListHeaderCell hug>
        <span className="sr-only">Thumbnail</span>
      </PlpListHeaderCell>
      <TableHead>Shape</TableHead>
      <TableHead className="text-center">Ct</TableHead>
      <TableHead className="text-center">Col</TableHead>
      <TableHead className="text-center">Cla</TableHead>
      <TableHead className="text-center">Cut</TableHead>
      <TableHead className="text-center">Pol</TableHead>
      <TableHead className="text-center">Sym</TableHead>
      <TableHead className="text-center">Fluor</TableHead>
      <TableHead className="text-center">Table</TableHead>
      <TableHead className="text-center">Depth</TableHead>
      <TableHead className="text-center">Ratio</TableHead>
      <TableHead>Measurements</TableHead>
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

export function DiamondPlpListRow({ item }: { item: DiamondItem }) {
  const userContext = useStorybookAppUser();
  const [selected, setSelected] = useState(false);
  const businessDays = getBusinessDays(item);

  const alternateCurrency =
    userContext.currency !== "USD"
      ? { amount: item.price, currency: userContext.currency }
      : undefined;

  return (
    <PlpListBodyRow selected={selected} onSelectedChange={setSelected}>
      <PlpListBodyCell hug>
        <PlpListRowMedia image={item.image} imageAlt={item.name} />
      </PlpListBodyCell>
      <PlpListBodyCell>{item.shape}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">{item.carat.toFixed(2)}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">{item.color}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">{item.clarity}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">{item.cut}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">{item.polish}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">{item.symmetry}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">{item.fluorescence}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">{item.tablePct}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">{item.depthPct.toFixed(1)}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">{item.ratio.toFixed(2)}</PlpListBodyCell>
      <PlpListBodyCell>{item.measurements}</PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowCert lab={item.certLab} number={item.certNumber} />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPrice
          amount={item.price}
          currency="USD"
          discount={item.discount}
          alternateCurrency={alternateCurrency}
        />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPricePerCarat amount={item.pricePerCarat} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowReturnable
          variant={item.isReturnable ? "returnable" : "non-returnable"}
        />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowDelivery
          variant={item.isExpress ? "express" : "regular"}
          businessDays={businessDays}
          date="Nov 18 – 23"
          origin={item.originFlag}
          shipsFrom={item.origin}
        />
      </PlpListBodyCell>
      <PlpListBodyCell sticky="right">
        <PlpListRowActions>
          <Button size="sm" variant="outline" onClick={noop}>
            Add
            <IconShoppingCart className="h-4 w-4" data-icon="inline-end" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="More actions"
                onClick={(e) => e.stopPropagation()}
              >
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onSelect={noop}>
                <IconHeart className="h-4 w-4" />
                Add to shortlist
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={noop}>
                <IconShare className="h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={noop}>
                <IconPhoto className="h-4 w-4" />
                View media
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </PlpListRowActions>
      </PlpListBodyCell>
    </PlpListBodyRow>
  );
}
