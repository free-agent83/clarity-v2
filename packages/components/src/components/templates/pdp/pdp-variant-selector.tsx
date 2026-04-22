import { cn } from "@/lib/utils";
import { Typography } from "../../atoms/typography/typography";
import type { PdpVariantSelectorProps } from "./pdp-types";

/**
 * Label + fieldset shell for variant controls. Consumer provides the actual
 * controls (ToggleGroup, RadioGroup, etc.). Disabled/OOS states are the
 * consumer's responsibility via their control's disabled prop.
 *
 * Categories without variants simply omit this primitive.
 */
export function PdpVariantSelector({ label, children, className }: PdpVariantSelectorProps) {
  return (
    <fieldset className={cn("flex flex-col gap-2 border-none p-0 m-0", className)} data-slot="pdp-variant-selector">
      <legend>
        <Typography variant="subtitle-2">{label}</Typography>
      </legend>
      {children}
    </fieldset>
  );
}
