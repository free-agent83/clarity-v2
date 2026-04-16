import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../molecules/breadcrumb/breadcrumb";
import type { BreadcrumbSegment } from "../plp-types";
import { Fragment } from "react";

/**
 * PLP heading area — breadcrumbs, category title, and results count.
 *
 * Breadcrumbs support arbitrary nesting. The last segment is rendered
 * as the current page (not a link). Results count announces via
 * `aria-live="polite"` when it changes.
 */
export function PlpHeading({
  breadcrumbs,
  title,
  resultsCount,
}: {
  breadcrumbs: BreadcrumbSegment[];
  title: string;
  resultsCount: number;
}) {
  const formattedCount = new Intl.NumberFormat("en-US").format(resultsCount);

  return (
    <div data-slot="plp-heading">
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((segment, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <Fragment key={segment.label}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={segment.href || "#"}>
                        {segment.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>

      <p
        className="mt-1 text-sm text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {formattedCount} results
      </p>
    </div>
  );
}
