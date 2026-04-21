import { useState } from "react";
import {
  IconDotsVertical,
  IconHeart,
  IconPhoto,
  IconShare,
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
  PlpListHeaderRow,
  PlpListRowActions,
  PlpListRowCert,
  PlpListRowDelivery,
  PlpListRowMedia,
  PlpListRowPrice,
  PlpListRowReturnable,
} from "../list/plp-list-row";
import { TableHead } from "../../../organisms/table/table";
import { useStorybookAppUser } from "../../../../../.storybook/app-user-context";
import { SAMPLE_360_VIDEO_URL } from "./sort-options";
import type { DiamondItem } from "./diamond-items";

const noop = () => {};

export function DiamondPlpGridItem({ item }: { item: DiamondItem }) {
  const userContext = useStorybookAppUser();

  const video =
    Number.parseInt(item.id.replace(/\D/g, ""), 10) % 3 === 0
      ? SAMPLE_360_VIDEO_URL
      : undefined;

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
      <TableHead style={{ width: 44 }}>
        <span className="sr-only">Select</span>
      </TableHead>
      <TableHead style={{ width: 73 }}>
        <span className="sr-only">Thumbnail</span>
      </TableHead>
      <TableHead>Shape</TableHead>
      <TableHead>Ct</TableHead>
      <TableHead>Col</TableHead>
      <TableHead>Cla</TableHead>
      <TableHead>Cut</TableHead>
      <TableHead>Pol</TableHead>
      <TableHead>Sym</TableHead>
      <TableHead>Fluor</TableHead>
      <TableHead>Table</TableHead>
      <TableHead>Depth</TableHead>
      <TableHead>Ratio</TableHead>
      <TableHead>Measurements</TableHead>
      <TableHead>Cert</TableHead>
      <TableHead>Price</TableHead>
      <TableHead>Ret</TableHead>
      <TableHead>Delivery</TableHead>
      <TableHead>
        <span className="sr-only">Actions</span>
      </TableHead>
    </PlpListHeaderRow>
  );
}

export function DiamondPlpListRow({ item }: { item: DiamondItem }) {
  const userContext = useStorybookAppUser();
  const [selected, setSelected] = useState(false);

  const alternateCurrency =
    userContext.currency !== "USD"
      ? { amount: item.price, currency: userContext.currency }
      : undefined;

  return (
    <PlpListBodyRow selected={selected} onSelectedChange={setSelected}>
      <PlpListBodyCell>
        <PlpListRowMedia image={item.image} imageAlt={item.name} />
      </PlpListBodyCell>
      <PlpListBodyCell>{item.shape}</PlpListBodyCell>
      <PlpListBodyCell>{item.carat.toFixed(2)}</PlpListBodyCell>
      <PlpListBodyCell>{item.color}</PlpListBodyCell>
      <PlpListBodyCell>{item.clarity}</PlpListBodyCell>
      <PlpListBodyCell>{item.cut}</PlpListBodyCell>
      <PlpListBodyCell>{item.polish}</PlpListBodyCell>
      <PlpListBodyCell>{item.symmetry}</PlpListBodyCell>
      <PlpListBodyCell>{item.fluorescence}</PlpListBodyCell>
      <PlpListBodyCell>{item.tablePct}</PlpListBodyCell>
      <PlpListBodyCell>{item.depthPct.toFixed(1)}</PlpListBodyCell>
      <PlpListBodyCell>{item.ratio.toFixed(2)}</PlpListBodyCell>
      <PlpListBodyCell>{item.measurements}</PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowCert lab={item.certLab} number={item.certNumber} />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPrice
          amount={item.price}
          currency="USD"
          perCarat={{ amount: item.pricePerCarat, currency: "USD" }}
          alternateCurrency={alternateCurrency}
        />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowReturnable
          variant={item.isReturnable ? "returnable" : "non-returnable"}
        />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowDelivery
          variant={item.isExpress ? "express" : "regular"}
          date="Nov 18 – 23"
          shipsFrom={item.origin}
        />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowActions>
          <Button size="sm" onClick={noop}>
            Add to cart
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
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
