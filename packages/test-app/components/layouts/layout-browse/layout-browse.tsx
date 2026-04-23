import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@nivoda/components";
import type { BreadcrumbItem as BreadcrumbItemType } from "../types";

type LayoutBrowseProps = {
  breadcrumbs: BreadcrumbItemType[];
  children: React.ReactNode;
  className?: string;
};

export function LayoutBrowse({
  breadcrumbs,
  children,
  className,
}: LayoutBrowseProps) {
  return (
    <div className={cn("flex flex-col gap-12 pb-32", className)}>
      <Breadcrumb>
        <BreadcrumbList className="gap-3 text-base">
          {breadcrumbs.map((item, i) => (
            <React.Fragment key={item.href}>
              {i > 0 && <BreadcrumbSeparator className="[&>svg]:size-4" />}
              <BreadcrumbItem>
                {i < breadcrumbs.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate">
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      {children}
    </div>
  );
}
