"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@nivoda/components";
import { Checkbox } from "@nivoda/components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nivoda/components";
import { Badge } from "@nivoda/components";
import { Tabs, TabsList, TabsTrigger } from "@nivoda/components";
import { PaginationControls } from "@/components/layouts/pagination-controls";
import { FilterBar, type FilterOption } from "@/components/filters/filter-bar";
import { SortButton, type SortOption } from "@/components/filters/sort-button";
import { SearchInput } from "@/components/filters/search-input";
import { IconDownload } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  UNPAID_STATUSES,
  STATUS_DOT_COLORS,
  formatStatus,
  type FinanceDocument,
} from "@/lib/api/finances";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PER_PAGE_OPTIONS = [10, 20, 40];
const DEFAULT_PER_PAGE = 20;

type TabKey = "all" | "unpaid" | "paid" | "credit_notes";

const FINANCE_FILTERS: FilterOption[] = [
  {
    key: "status",
    label: "Status",
    options: ["Issued", "Partially Paid", "Paid", "Overdue", "Cancelled"],
  },
  {
    key: "payment_method",
    label: "Payment terms",
    options: ["Wire Transfer", "Credit Card", "Net Terms"],
  },
  {
    key: "issue_date",
    label: "Issue date",
    options: [
      "Last 7 days",
      "Last 30 days",
      "Last 3 months",
      "Last 6 months",
      "Last year",
    ],
  },
];

const SORT_OPTIONS: SortOption[] = [
  {
    value: "issue_date_desc",
    label: "Issue date (newest)",
    displayLabel: "Date issued",
  },
  {
    value: "issue_date_asc",
    label: "Issue date (oldest)",
    displayLabel: "Date issued (oldest)",
  },
  {
    value: "due_date_asc",
    label: "Due date (nearest)",
    displayLabel: "Due date",
  },
  {
    value: "due_date_desc",
    label: "Due date (farthest)",
    displayLabel: "Due date (farthest)",
  },
  {
    value: "amount_desc",
    label: "Amount: High to Low",
    displayLabel: "Amount (high)",
  },
  {
    value: "amount_asc",
    label: "Amount: Low to High",
    displayLabel: "Amount (low)",
  },
  { value: "status", label: "Status", displayLabel: "Status" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUsd(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPaymentMethod(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function matchesDateRange(dateStr: string, range: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

  switch (range) {
    case "Last 7 days":
      return diffDays <= 7;
    case "Last 30 days":
      return diffDays <= 30;
    case "Last 3 months":
      return diffDays <= 90;
    case "Last 6 months":
      return diffDays <= 180;
    case "Last year":
      return diffDays <= 365;
    default:
      return true;
  }
}

function matchesFilter(
  doc: FinanceDocument,
  key: string,
  selectedValues: string[],
): boolean {
  if (selectedValues.length === 0) return true;

  switch (key) {
    case "status":
      return selectedValues.includes(
        formatStatus(doc.currentStatus?.value ?? ""),
      );
    case "payment_method":
      return selectedValues.includes(
        formatPaymentMethod(doc.paymentMethod.value),
      );
    case "issue_date":
      return selectedValues.some((range) =>
        matchesDateRange(doc.issueDate, range),
      );
    default:
      return true;
  }
}

function sortDocuments(
  docs: FinanceDocument[],
  sortValue: string,
): FinanceDocument[] {
  const sorted = [...docs];
  switch (sortValue) {
    case "issue_date_desc":
      return sorted.sort(
        (a, b) =>
          new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
      );
    case "issue_date_asc":
      return sorted.sort(
        (a, b) =>
          new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime(),
      );
    case "due_date_asc":
      return sorted.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      );
    case "due_date_desc":
      return sorted.sort(
        (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
      );
    case "amount_desc":
      return sorted.sort((a, b) => b.totalAmountUsd - a.totalAmountUsd);
    case "amount_asc":
      return sorted.sort((a, b) => a.totalAmountUsd - b.totalAmountUsd);
    case "status":
      return sorted.sort((a, b) =>
        (a.currentStatus?.value ?? "").localeCompare(
          b.currentStatus?.value ?? "",
        ),
      );
    default:
      return sorted;
  }
}

function filterByTab(docs: FinanceDocument[], tab: TabKey): FinanceDocument[] {
  switch (tab) {
    case "unpaid":
      return docs.filter((d) =>
        UNPAID_STATUSES.includes(d.currentStatus?.value ?? ""),
      );
    case "paid":
      return docs.filter((d) => d.currentStatus?.value === "paid");
    case "credit_notes":
      return docs.filter((d) => d.type === "credit_note");
    default:
      return docs;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ doc }: { doc: FinanceDocument }) {
  const statusValue = doc.currentStatus?.value ?? "unknown";
  const dotColor = STATUS_DOT_COLORS[statusValue] ?? "bg-muted-foreground";
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("size-2 shrink-0 rounded-full", dotColor)} />
      <span className="text-sm font-medium">{formatStatus(statusValue)}</span>
    </div>
  );
}

function DocumentRow({ doc }: { doc: FinanceDocument }) {
  return (
    <TableRow>
      <TableCell className="w-10 pr-0">
        <Checkbox />
      </TableCell>
      <TableCell>
        <Link href={`/buyer/finances/${doc.id}`} className="block">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {doc.invoiceNumber}
            </span>
            <span className="text-sm text-muted-foreground">
              {doc.itemCount} item{doc.itemCount !== 1 ? "s" : ""} &middot;{" "}
              {formatPaymentMethod(doc.paymentMethod.value)}
            </span>
          </div>
        </Link>
      </TableCell>
      <TableCell className="text-right text-sm">
        {formatUsd(doc.totalAmountUsd)}
      </TableCell>
      <TableCell className="text-right text-sm">
        {formatUsd(doc.balanceDue)}
      </TableCell>
      <TableCell className="text-right text-sm">
        {formatUsd(doc.settledAmount)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(doc.issueDate)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(doc.dueDate)}
      </TableCell>
      <TableCell>
        <StatusBadge doc={doc} />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon-sm">
            <IconDownload className="size-4" />
          </Button>
          {doc.type === "invoice" &&
            UNPAID_STATUSES.includes(doc.currentStatus?.value ?? "") && (
              <Button variant="default" size="sm">
                Pay now
              </Button>
            )}
          {doc.type === "credit_note" && doc.balanceDue > 0 && (
            <Button variant="outline" size="sm">
              Allocate
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface FinancesTableProps {
  documents: FinanceDocument[];
}

export function FinancesTable({ documents }: FinancesTableProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sortValue, setSortValue] = useState("issue_date_desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  // Search across invoice number and payment method
  const searchFiltered = useMemo(() => {
    if (!searchQuery) return documents;
    const q = searchQuery.toLowerCase();
    return documents.filter(
      (doc) =>
        doc.invoiceNumber.toLowerCase().includes(q) ||
        formatPaymentMethod(doc.paymentMethod.value).toLowerCase().includes(q),
    );
  }, [documents, searchQuery]);

  // Apply tab filter
  const tabFiltered = useMemo(
    () => filterByTab(searchFiltered, activeTab),
    [searchFiltered, activeTab],
  );

  // Tab counts (computed from search-filtered, before other filters)
  const tabCounts = useMemo(() => {
    const unpaid = searchFiltered.filter((d) =>
      UNPAID_STATUSES.includes(d.currentStatus?.value ?? ""),
    ).length;
    return {
      all: searchFiltered.length,
      unpaid,
      paid: searchFiltered.filter((d) => d.currentStatus?.value === "paid")
        .length,
      credit_notes: searchFiltered.filter((d) => d.type === "credit_note")
        .length,
    };
  }, [searchFiltered]);

  // Apply user-selected filters
  const fullyFiltered = useMemo(() => {
    const keys = Object.keys(filters);
    if (keys.length === 0) return tabFiltered;
    return tabFiltered.filter((doc) =>
      keys.every((key) => matchesFilter(doc, key, filters[key])),
    );
  }, [tabFiltered, filters]);

  // Sort
  const sorted = useMemo(
    () => sortDocuments(fullyFiltered, sortValue),
    [fullyFiltered, sortValue],
  );

  // Paginate
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  // Reset page when filters/search/sort/tab change
  function handleFiltersChange(next: Record<string, string[]>) {
    setFilters(next);
    setPage(1);
  }

  function handleSortChange(next: string) {
    setSortValue(next);
    setPage(1);
  }

  function handleSearch(query: string) {
    setSearchQuery(query);
    setPage(1);
  }

  function handleTabChange(value: string) {
    setActiveTab(value as TabKey);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList variant="line">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unpaid" className="gap-1.5">
            Unpaid
            {tabCounts.unpaid > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5">
                {tabCounts.unpaid}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="credit_notes">Credit notes</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          <SearchInput onSearch={handleSearch} placeholder="Search..." />
          <FilterBar
            filters={FINANCE_FILTERS}
            value={filters}
            onChange={handleFiltersChange}
          />
        </div>
        <SortButton
          options={SORT_OPTIONS}
          value={sortValue}
          onChange={handleSortChange}
        />
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 pr-0">
              <Checkbox />
            </TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">Total inc. tax</TableHead>
            <TableHead className="text-right">Balance due</TableHead>
            <TableHead className="text-right">Settled amount</TableHead>
            <TableHead>Issued</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
          {pageItems.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-12 text-center text-muted-foreground"
              >
                No documents match your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * perPage + 1}-
            {Math.min(currentPage * perPage, totalItems)} of {totalItems}
          </span>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            perPage={perPage}
            perPageOptions={PER_PAGE_OPTIONS}
            onPageChange={setPage}
            onPerPageChange={(pp) => {
              setPerPage(pp);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
