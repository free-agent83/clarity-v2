import { redirect } from "next/navigation";
import { LayoutBrowse } from "@/components/layouts/layout-browse/layout-browse";
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

  return (
    <LayoutBrowse
      breadcrumbs={[
        { label: "Home", href: "/buyer" },
        {
          label: "Search results",
          href: `/buyer/search?q=${encodeURIComponent(q)}`,
        },
      ]}
    >
      <div className="flex flex-col gap-6">
        <h1 className="text-[34px] font-medium leading-[42px] tracking-[0.25px] text-foreground">
          Search results for &ldquo;{q}&rdquo;
        </h1>
        <SearchResultsContent query={q} />
      </div>
    </LayoutBrowse>
  );
}
