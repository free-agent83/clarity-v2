import { Fragment } from "react";
import { Typography } from "../../atoms/typography/typography";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../molecules/breadcrumb/breadcrumb";
import type { BreadcrumbSegment } from "./plp-types";

export interface PlpHeadingProps {
  breadcrumbs: BreadcrumbSegment[];
  title: string;
  resultsCount: number;
}

/**
 * PLP heading — breadcrumbs, category title, and results count.
 *
 * Breadcrumbs support arbitrary nesting; the last segment renders as the
 * current page (not a link). Results count announces via
 * `aria-live="polite"` when it changes.
 */
export function PlpHeading({ breadcrumbs, title, resultsCount }: PlpHeadingProps) {
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

      <Typography as="h1" variant="h3" className="mt-6">
        {title}
      </Typography>

      <Typography
        variant="body-2"
        className="mt-1 text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {formattedCount} results
      </Typography>
    </div>
  );
}
