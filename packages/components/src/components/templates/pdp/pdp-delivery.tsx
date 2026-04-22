import { IconMapPin, IconTruckDelivery } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { BrandExpress } from "../../atoms/brand-express/brand-express";
import { Typography } from "../../atoms/typography/typography";
import type { PdpDeliveryProps } from "./pdp-types";

/**
 * Delivery timeline for the PDP body. Same variant axis as PlpGridItemDelivery,
 * rendered at PDP density (more verbose than grid item).
 *
 * Express: shows BrandExpress badge + date in express colour.
 * Regular: shows truck icon + estimated delivery with bold date.
 */
export function PdpDelivery({ variant, date, shipsFrom, className }: PdpDeliveryProps) {
  return (
    <div className={cn("flex flex-col", className)} data-slot="pdp-delivery">
      <div className="flex items-center gap-2">
        {variant === "express"
          ? <BrandExpress className="h-3 shrink-0" aria-label="Express delivery" />
          : <IconTruckDelivery size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />}
        <Typography className="text-muted-foreground" variant="body-2">
          {variant === "express"
            ? <span className="text-express">Get it {date}</span>
            : <>Delivered in <span className="text-foreground">{date}</span></>}
        </Typography>
      </div>
      {shipsFrom && (
        <div className="flex items-center gap-2 pl-6">
          <Typography variant="caption" className="text-muted-foreground">Ships from <span className="text-foreground">{shipsFrom}</span></Typography>
        </div>
      )}
    </div>
  );
}
