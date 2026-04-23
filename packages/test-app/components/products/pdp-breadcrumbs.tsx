import { Fragment } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@nivoda/components";

export type PdpBreadcrumbSegment = {
  label: string;
  href: string;
};

export function PdpBreadcrumbs({
  segments,
}: {
  segments: PdpBreadcrumbSegment[];
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-3 text-base">
        {segments.map((segment, i) => (
          <Fragment key={segment.href}>
            {i > 0 && <BreadcrumbSeparator className="[&>svg]:size-4" />}
            <BreadcrumbItem>
              {i < segments.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link href={segment.href}>{segment.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="truncate">
                  {segment.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
