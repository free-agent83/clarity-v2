import { cn } from "@/lib/utils";
import type { PdpPrimaryActionProps } from "./pdp-types";

/**
 * Full-width CTA area with an optional secondary actions zone.
 * Consumer provides the Button — this shell enforces width and spacing only.
 */
export function PdpPrimaryAction({ children, secondaryActions, className }: PdpPrimaryActionProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)} data-slot="pdp-primary-action">
      <div className="w-full">{children}</div>
      {secondaryActions && (
        <div className="flex items-center gap-2" data-slot="pdp-primary-action-secondary">
          {secondaryActions}
        </div>
      )}
    </div>
  );
}
