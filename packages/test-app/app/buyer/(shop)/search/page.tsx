import { Fragment } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@nivoda/components";

import { SearchResultsContent } from "@/components/search/search-results-content";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  // Redirect short/missing queries to home with search dialog open
  if (!q || q.length < 2) {
    const searchParam = q ?? "true";
    redirect(`/buyer?search=${encodeURIComponent(searchParam)}`);
  }

  const breadcrumbs = [
    { label: "Home", href: "/buyer" },
    {
      label: "Search results",
      href: `/buyer/search?q=${encodeURIComponent(q)}`,
    },
  ];

  return (
    <div className="flex flex-col gap-12 pb-32">
      <Breadcrumb>
        <BreadcrumbList className="gap-3 text-base">
          {breadcrumbs.map((item, i) => (
            <Fragment key={item.href}>
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
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-6">
        <h1 className="text-[34px] font-medium leading-10.5 tracking-[0.25px] text-foreground">
          Search results for &ldquo;{q}&rdquo;
        </h1>
        <SearchResultsContent query={q} />
      </div>
    </div>
  );
}
