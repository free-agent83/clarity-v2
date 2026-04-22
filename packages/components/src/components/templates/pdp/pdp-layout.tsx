import { cn } from "@/lib/utils";
import type { PdpLayoutProps } from "./pdp-types";

/**
 * PDP two-column layout shell. No logic, no state — pure CSS layout.
 *
 * Left column (`media`) is sticky. Right column (`body`) scrolls naturally.
 * `children` renders below both columns at full width; consumer controls order.
 *
 * Pass `stickyTop` to clear a fixed app header (e.g. `stickyTop="64px"`).
 */
export function PdpLayout({ media, body, children, stickyTop = "0px", className }: PdpLayoutProps) {
  return (
    <div className={cn("flex flex-col gap-8", className)} data-slot="pdp-layout">
      <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:items-start md:gap-12">
        <div className="md:sticky" style={{ top: stickyTop }} data-slot="pdp-layout-media">
          {media}
        </div>
        <div data-slot="pdp-layout-body">{body}</div>
      </div>
      {children && <div data-slot="pdp-layout-below">{children}</div>}
    </div>
  );
}
