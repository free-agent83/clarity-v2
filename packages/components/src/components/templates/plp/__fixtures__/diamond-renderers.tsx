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
  PlpListCell,
  PlpListHeaderCell,
  PlpListHeaderRow,
  PlpListRow,
  PlpListRowActions,
  PlpListRowCheckbox,
  PlpListRowDelivery,
  PlpListRowMedia,
  PlpListRowName,
  PlpListRowPrice,
  PlpListRowPricePerCarat,
  PlpListRowReturnable,
} from "../list/plp-list-row";
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
      <PlpListHeaderCell width={44}>
        <span className="sr-only">Select</span>
      </PlpListHeaderCell>
      <PlpListHeaderCell width={72}>
        <span className="sr-only">Thumbnail</span>
      </PlpListHeaderCell>
      <PlpListHeaderCell>Name</PlpListHeaderCell>
      <PlpListHeaderCell align="right">Carat</PlpListHeaderCell>
      <PlpListHeaderCell>Shape</PlpListHeaderCell>
      <PlpListHeaderCell align="center">Color</PlpListHeaderCell>
      <PlpListHeaderCell align="center">Clarity</PlpListHeaderCell>
      <PlpListHeaderCell>Origin</PlpListHeaderCell>
      <PlpListHeaderCell>Certificate</PlpListHeaderCell>
      <PlpListHeaderCell>Delivery</PlpListHeaderCell>
      <PlpListHeaderCell>Returns</PlpListHeaderCell>
      <PlpListHeaderCell>Price</PlpListHeaderCell>
      <PlpListHeaderCell>Price/ct</PlpListHeaderCell>
      <PlpListHeaderCell align="right">
        <span className="sr-only">Actions</span>
      </PlpListHeaderCell>
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
    <PlpListRow selected={selected}>
      <PlpListCell>
        <PlpListRowCheckbox checked={selected} onChange={setSelected} />
      </PlpListCell>
      <PlpListCell>
        <PlpListRowMedia image={item.image} imageAlt={item.name} />
      </PlpListCell>
      <PlpListCell>
        <div className="flex flex-col gap-0.5">
          <PlpListRowName>{item.name}</PlpListRowName>
          <Typography as="div" variant="caption" className="text-muted-foreground">
            {item.stockId}
          </Typography>
        </div>
      </PlpListCell>
      <PlpListCell align="right">{item.carat.toFixed(2)}</PlpListCell>
      <PlpListCell>{item.shape}</PlpListCell>
      <PlpListCell align="center">{item.color}</PlpListCell>
      <PlpListCell align="center">{item.clarity}</PlpListCell>
      <PlpListCell>{item.origin}</PlpListCell>
      <PlpListCell>
        <span className="font-mono text-xs">
          {item.certLab} {item.certNumber}
        </span>
      </PlpListCell>
      <PlpListCell>
        <PlpListRowDelivery
          variant={item.isExpress ? "express" : "regular"}
          date="Nov 18 – 23"
          shipsFrom={item.origin}
        />
      </PlpListCell>
      <PlpListCell>
        <PlpListRowReturnable
          variant={item.isReturnable ? "returnable" : "non-returnable"}
        />
      </PlpListCell>
      <PlpListCell>
        <PlpListRowPrice
          amount={item.price}
          currency="USD"
          alternateCurrency={alternateCurrency}
        />
      </PlpListCell>
      <PlpListCell>
        <PlpListRowPricePerCarat amount={item.pricePerCarat} currency="USD" />
      </PlpListCell>
      <PlpListCell align="right">
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
      </PlpListCell>
    </PlpListRow>
  );
}
