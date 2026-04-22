import { IconArrowBackUp, IconBan } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Typography } from "../../atoms/typography/typography";
import type { PdpReturnsProps } from "./pdp-types";

/**
 * Returns policy for the PDP body. Same variant axis as PlpGridItemReturnable,
 * with additional PDP-specific fields for the returns window and policy link.
 */
export function PdpReturns({ variant, returnsWindow, policyLink, className }: PdpReturnsProps) {
  const returnable = variant === "returnable";
  return (
    <div className={cn("flex items-center gap-2", className)} data-slot="pdp-returns">
      {returnable
        ? <IconArrowBackUp size={16} className="shrink-0 text-success" aria-hidden="true" />
        : <IconBan size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />}
      <Typography variant="body-2">
        {returnable ? (
          <>
            <span className="font-medium text-success">{returnsWindow ? `${returnsWindow} returns` : "Returnable"}</span>
            {policyLink && <span className="text-muted-foreground"> · {policyLink}</span>}
          </>
        ) : (
          <span className="text-muted-foreground">Non-returnable</span>
        )}
      </Typography>
    </div>
  );
}
