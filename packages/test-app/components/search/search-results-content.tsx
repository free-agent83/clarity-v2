"use client";

import { useSearch } from "@/hooks/use-search";
import type {
  SearchResultProduct,
  SearchResultOrder,
  SearchResultRequest,
  SearchResultInvoice,
} from "@/hooks/use-search";
import { SearchSectionProducts } from "@/components/search/search-section-products";
import { SearchSectionTable } from "@/components/search/search-section-table";
import { IconSearch, IconLoader2 } from "@tabler/icons-react";

type SearchResultsContentProps = {
  query: string;
};

// ---------------------------------------------------------------------------
// Helpers: build table rows from typed results
// ---------------------------------------------------------------------------

function ItemCell({
  image,
  title,
  subtitle,
}: {
  image: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-5">
      <img
        src={image}
        alt={title}
        className="size-12 shrink-0 rounded-md object-cover"
      />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-foreground">
          {title}
        </span>
        <span className="truncate text-sm text-muted-foreground">
          {subtitle}
        </span>
      </div>
    </div>
  );
}

function buildOrderRows(items: SearchResultOrder[]) {
  return items.map((item) => ({
    id: item.id,
    href: item.href,
    cells: {
      item: (
        <ItemCell
          image={item.image}
          title={item.title}
          subtitle={item.subtitle}
        />
      ),
      date: <span className="text-sm text-foreground">{item.date}</span>,
      status: <StatusPill status={item.status} />,
    },
  }));
}

function buildRequestRows(items: SearchResultRequest[]) {
  return items.map((item) => ({
    id: item.id,
    href: item.href,
    cells: {
      item: (
        <ItemCell
          image={item.image}
          title={item.title}
          subtitle={item.subtitle}
        />
      ),
      date: <span className="text-sm text-foreground">{item.date}</span>,
      status: <StatusPill status={item.status} />,
    },
  }));
}

function buildInvoiceRows(items: SearchResultInvoice[]) {
  return items.map((item) => ({
    id: item.id,
    href: item.href,
    cells: {
      invoice: (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {item.title}
          </span>
        </div>
      ),
      date: <span className="text-sm text-foreground">{item.date}</span>,
      amount: <span className="text-sm text-foreground">{item.amount}</span>,
      status: <StatusPill status={item.status} />,
    },
  }));
}

// ---------------------------------------------------------------------------
// Status pill
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  Delivered: "bg-green-50 text-foreground dark:bg-green-950",
  "In Transit": "bg-blue-50 text-foreground dark:bg-blue-950",
  Processing: "bg-muted text-foreground",
  "Pending Payment": "bg-amber-50 text-foreground dark:bg-amber-950",
  Paid: "bg-green-50 text-foreground dark:bg-green-950",
  Pending: "bg-amber-50 text-foreground dark:bg-amber-950",
  Requested: "bg-muted text-foreground",
  "Quote available": "bg-blue-50 text-foreground dark:bg-blue-950",
  Delayed: "bg-amber-50 text-foreground dark:bg-amber-950",
  Confirmed: "bg-green-50 text-foreground dark:bg-green-950",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  Delivered: "bg-green-500",
  "In Transit": "bg-blue-500",
  Processing: "bg-neutral-400",
  "Pending Payment": "bg-amber-500",
  Paid: "bg-green-500",
  Pending: "bg-amber-500",
  Requested: "bg-neutral-400",
  "Quote available": "bg-blue-500",
  Delayed: "bg-amber-500",
  Confirmed: "bg-green-500",
};

function StatusPill({ status }: { status: string }) {
  const bg = STATUS_COLORS[status] ?? "bg-muted text-foreground";
  const dot = STATUS_DOT_COLORS[status] ?? "bg-neutral-400";

  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-full px-3 py-1 text-[13px] font-medium ${bg}`}
    >
      <span className={`size-2 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const ORDER_COLUMNS = [
  { key: "item", label: "Item", className: "flex-1 min-w-[260px]" },
  { key: "date", label: "Date", className: "w-[120px]" },
  { key: "status", label: "Status", className: "w-[230px]" },
];

const REQUEST_COLUMNS = [
  { key: "item", label: "Item", className: "flex-1 min-w-[260px]" },
  { key: "date", label: "Request date", className: "w-[120px]" },
  { key: "status", label: "Status", className: "w-[230px]" },
];

const INVOICE_COLUMNS = [
  { key: "invoice", label: "Invoice", className: "flex-1 min-w-[200px]" },
  { key: "date", label: "Date", className: "w-[120px]" },
  { key: "amount", label: "Amount", className: "w-[120px]" },
  { key: "status", label: "Status", className: "w-[150px]" },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SearchResultsContent({ query }: SearchResultsContentProps) {
  const { results, isLoading, totalCount } = useSearch(query);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <IconLoader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No results
  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <IconSearch size={48} className="text-muted-foreground/50" />
        <h2 className="text-lg font-medium">
          No results found for &ldquo;{query}&rdquo;
        </h2>
        <p className="text-sm text-muted-foreground">
          Try searching with different terms
        </p>
      </div>
    );
  }

  // Group products by subcategory
  const productsBySubcategory = new Map<string, SearchResultProduct[]>();
  for (const product of results.products) {
    const group = productsBySubcategory.get(product.subcategory) ?? [];
    group.push(product);
    productsBySubcategory.set(product.subcategory, group);
  }

  return (
    <div className="flex flex-col gap-[72px]">
      {/* Product sections — one per subcategory */}
      {Array.from(productsBySubcategory.entries()).map(
        ([subcategory, items]) => (
          <SearchSectionProducts
            key={subcategory}
            subcategory={subcategory}
            items={items}
          />
        ),
      )}

      {/* Requests */}
      {results.requests.length > 0 && (
        <SearchSectionTable
          title="Requests"
          count={results.requests.length}
          columns={REQUEST_COLUMNS}
          rows={buildRequestRows(results.requests)}
        />
      )}

      {/* Orders */}
      {results.orders.length > 0 && (
        <SearchSectionTable
          title="Orders"
          count={results.orders.length}
          columns={ORDER_COLUMNS}
          rows={buildOrderRows(results.orders)}
        />
      )}

      {/* Invoices */}
      {results.invoices.length > 0 && (
        <SearchSectionTable
          title="Invoices"
          count={results.invoices.length}
          columns={INVOICE_COLUMNS}
          rows={buildInvoiceRows(results.invoices)}
        />
      )}
    </div>
  );
}
