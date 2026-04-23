import {
  IconBan,
  IconInfoCircle,
  IconRefresh,
  IconTruck,
} from "@tabler/icons-react";

import { getPlpItemMock } from "./plp-item-mocks";

export type ProductShippingInfoProps = {
  id: string;
};

export function ProductShippingInfo({ id }: ProductShippingInfoProps) {
  const mock = getPlpItemMock(id);

  return (
    <div className="flex flex-col gap-1">
      {mock.isReturnable ? (
        <div className="flex items-start gap-3">
          <IconRefresh
            size={24}
            className="mt-0.5 shrink-0 text-foreground"
          />
          <div className="flex flex-wrap items-center gap-1 pt-0.5 text-sm">
            <span className="font-medium text-[#3d745c]">14-day returns</span>
            <span className="text-muted-foreground">
              · Returns Policy applies
            </span>
            <IconInfoCircle size={18} className="text-muted-foreground" />
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <IconBan
            size={24}
            className="mt-0.5 shrink-0 text-muted-foreground"
          />
          <span className="pt-0.5 text-sm font-medium text-muted-foreground">
            Non-returnable
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <IconTruck size={24} className="mt-0.5 shrink-0 text-foreground" />
        <div className="flex flex-wrap items-center gap-1 pt-0.5 text-sm">
          <span className="text-muted-foreground">
            {mock.isExpress ? "Express delivery · Get it" : "Get it"}
          </span>
          <span className="font-medium text-foreground">
            {mock.deliveryDate}
          </span>
          <span className="text-muted-foreground">
            · Ships from {mock.shipsFrom}
          </span>
        </div>
      </div>
    </div>
  );
}
