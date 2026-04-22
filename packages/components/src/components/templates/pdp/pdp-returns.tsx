import { IconArrowBackUp, IconBan } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Typography } from "../../atoms/typography/typography";
import type { PdpReturnsProps } from "./pdp-types";

/**
 * Returns policy for the PDP body. Same variant axis as PlpGridItemReturnable,
 * with additional PDP-specific fields for the returns window and policy link.
 *
 * Returnable items always link to their policy — the link is a required prop
 * when `variant === "returnable"`.
 */
export function PdpReturns(props: PdpReturnsProps) {
  if (props.variant === "non-returnable") {
    return (
      <div className={cn("flex items-center gap-2", props.className)} data-slot="pdp-returns">
        <IconBan size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
        <Typography variant="body-2">
          <span className="text-muted-foreground">Non-returnable</span>
        </Typography>
      </div>
    );
  }
  const { returnsWindow, policyLink, className } = props;
  return (
    <div className={cn("flex items-center gap-2", className)} data-slot="pdp-returns">
      <IconArrowBackUp size={16} className="shrink-0 text-success" aria-hidden="true" />
      <Typography variant="body-2">
        <span className="font-medium text-success">{returnsWindow ? `${returnsWindow} returns` : "Returnable"}</span>
        <span className="text-muted-foreground"> · {policyLink}</span>
      </Typography>
    </div>
  );
}
