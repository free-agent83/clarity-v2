"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/layouts/pagination-controls";
import { FilterBar, type FilterOption } from "@/components/filters/filter-bar";
import { SortButton, type SortOption } from "@/components/filters/sort-button";
import { SearchInput } from "@/components/filters/search-input";
import {
  IconDots,
  IconChecklist,
  IconClock,
  IconCircleCheck,
  IconTruck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/api/orders";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PER_PAGE_OPTIONS = [20, 40, 60, 80, 100];
const DEFAULT_PER_PAGE = 20;

const STATUS_DOT_COLORS: Record<string, string> = {
  requested: "bg-foreground",
  confirmed: "bg-emerald-500",
  manufacturing: "bg-violet-500",
  shipped: "bg-blue-500",
  delivered: "bg-emerald-500",
  returned: "bg-muted-foreground",
  cancelled: "bg-muted-foreground",
  delayed: "bg-amber-500",
  sold_out: "bg-amber-500",
};

type TabDef = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  statusValues: string[];
  hasNotification?: boolean;
};

const TABS: TabDef[] = [
  { key: "all", label: "All items", icon: IconChecklist, statusValues: [] },
  {
    key: "pending",
    label: "Pending",
    icon: IconClock,
    statusValues: ["Requested"],
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: IconCircleCheck,
    statusValues: ["Confirmed", "Manufacturing"],
  },
  {
    key: "in_transit",
    label: "In transit",
    icon: IconTruck,
    statusValues: ["Shipped"],
  },
  {
    key: "action_required",
    label: "Action required",
    icon: IconAlertTriangle,
    statusValues: ["Delayed"],
    hasNotification: true,
  },
];

const ORDER_FILTERS: FilterOption[] = [
  {
    key: "status",
    label: "Status",
    options: [
      "Requested",
      "Confirmed",
      "Manufacturing",
      "Shipped",
      "Delivered",
      "Returned",
      "Cancelled",
      "Delayed",
    ],
  },
  {
    key: "item_type",
    label: "Item type",
    options: [
      "Natural Diamond",
      "Lab Grown Diamond",
      "Gemstone",
      "Natural Melee",
      "Lab Grown Melee",
      "Engagement Ring",
      "Wedding Band",
      "Tennis Bracelet",
    ],
  },
  {
    key: "order_date",
    label: "Order date",
    options: [
      "Last 7 days",
      "Last 30 days",
      "Last 3 months",
      "Last 6 months",
      "Last year",
    ],
  },
  {
    key: "returnable",
    label: "Returnable",
    options: ["Yes", "No"],
  },
  {
    key: "confirmed_by",
    label: "Confirmed by",
    options: ["Supplier A", "Supplier B", "Supplier C"],
  },
  {
    key: "ship_to",
    label: "Ship to",
    options: [],
  },
];

const SORT_OPTIONS: SortOption[] = [
  {
    value: "order_date_desc",
    label: "Order date (newest)",
    displayLabel: "Order date",
  },
  {
    value: "order_date_asc",
    label: "Order date (oldest)",
    displayLabel: "Order date (oldest)",
  },
  {
    value: "price_desc",
    label: "Price: High to Low",
    displayLabel: "Price (high)",
  },
  {
    value: "price_asc",
    label: "Price: Low to High",
    displayLabel: "Price (low)",
  },
  { value: "status", label: "Status", displayLabel: "Status" },
  {
    value: "est_delivery",
    label: "Est. delivery",
    displayLabel: "Est. delivery",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getOrderStatus(order: Order): string {
  return order.currentStatus?.value ?? "";
}

function getOrderProductType(order: Order): string {
  const snapshot = (order.products[0]?.snapshot ?? {}) as Record<
    string,
    unknown
  >;
  return (snapshot.productType as string) ?? "";
}

function getOrderCountry(order: Order): string {
  return order.deliveryAddress.country;
}

function matchesDateRange(orderDate: string, range: string): boolean {
  const date = new Date(orderDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

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
  order: Order,
  key: string,
  selectedValues: string[],
): boolean {
  if (selectedValues.length === 0) return true;

  switch (key) {
    case "status":
      return selectedValues.includes(getOrderStatus(order));
    case "item_type":
      return selectedValues.includes(getOrderProductType(order));
    case "order_date":
      return selectedValues.some((range) =>
        matchesDateRange(order.orderDate, range),
      );
    case "returnable":
      // Mock: no real field yet
      return true;
    case "confirmed_by":
      // Mock: no real field yet
      return true;
    case "ship_to":
      return selectedValues.includes(getOrderCountry(order));
    default:
      return true;
  }
}

function sortOrders(orders: Order[], sortValue: string): Order[] {
  const sorted = [...orders];
  switch (sortValue) {
    case "order_date_desc":
      return sorted.sort(
        (a, b) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
      );
    case "order_date_asc":
      return sorted.sort(
        (a, b) =>
          new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime(),
      );
    case "price_desc":
      return sorted.sort((a, b) => b.finalPriceUsd - a.finalPriceUsd);
    case "price_asc":
      return sorted.sort((a, b) => a.finalPriceUsd - b.finalPriceUsd);
    case "status":
      return sorted.sort((a, b) =>
        getOrderStatus(a).localeCompare(getOrderStatus(b)),
      );
    case "est_delivery":
      return sorted.sort(
        (a, b) =>
          new Date(a.estimatedDelivery).getTime() -
          new Date(b.estimatedDelivery).getTime(),
      );
    default:
      return sorted;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function GridTab({
  tab,
  count,
  active,
  onClick,
}: {
  tab: TabDef;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 text-left transition-colors",
        active
          ? "border-primary bg-background shadow-sm"
          : "border-border bg-background hover:bg-muted/50",
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            "size-5",
            active ? "text-primary" : "text-muted-foreground",
          )}
        />
        {tab.hasNotification && (
          <span className="size-1.5 rounded-full bg-destructive" />
        )}
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            "text-sm font-medium",
            active ? "text-primary" : "text-foreground",
          )}
        >
          {tab.label}
        </span>
        <span className="text-sm text-muted-foreground">
          {count.toLocaleString()} items
        </span>
      </div>
    </button>
  );
}

function StatusBadge({ order }: { order: Order }) {
  const statusValue = getOrderStatus(order);
  const dotColor =
    STATUS_DOT_COLORS[statusValue.toLowerCase().replace(/\s+/g, "_")] ??
    "bg-muted-foreground";
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("size-2 shrink-0 rounded-full", dotColor)} />
      <span className="text-sm font-medium">{statusValue || "Unknown"}</span>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const firstProduct = order.products[0];
  const snapshot = (firstProduct?.snapshot ?? {}) as Record<string, unknown>;
  const itemTitle =
    (snapshot.description as string) ??
    (snapshot.title as string) ??
    `Order ${order.orderNumber}`;
  const itemImage = (snapshot.image as string) ?? "";
  const itemTypeLabel = (snapshot.productType as string) ?? "";
  const itemSubtitle = (snapshot.subtitle as string) ?? "";

  return (
    <TableRow>
      <TableCell className="w-10 pr-0">
        <Checkbox />
      </TableCell>
      <TableCell className="max-w-md">
        <Link href={`/buyer/orders/${order.id}`} className="block">
          <div className="flex flex-col gap-3 py-2">
            <div className="flex items-center gap-3">
              {itemImage && (
                <div className="size-12 shrink-0 overflow-hidden rounded-md border border-border">
                  <img
                    src={itemImage}
                    alt={itemTitle}
                    className="size-full object-cover"
                  />
                </div>
              )}
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium text-foreground">
                    {itemTitle}
                  </span>
                  {itemTypeLabel && (
                    <span className="text-sm text-muted-foreground">
                      · {itemTypeLabel}
                    </span>
                  )}
                </div>
                {itemSubtitle && (
                  <span className="truncate text-sm text-muted-foreground">
                    {itemSubtitle}
                  </span>
                )}
              </div>
            </div>
            {(order.canTrack || order.canPayInvoice) && (
              <div className="flex items-center gap-2 pl-15">
                {order.canTrack && (
                  <Button variant="outline" size="sm">
                    Track item
                  </Button>
                )}
                {order.canPayInvoice && (
                  <Button variant="default" size="sm">
                    Pay invoice
                  </Button>
                )}
              </div>
            )}
          </div>
        </Link>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {order.orderNumber}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {order.orderDate}
      </TableCell>
      <TableCell>
        <StatusBadge order={order} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            $
            {order.finalPriceUsd.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
          {order.exchangeRates.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {order.exchangeRates[0].currency.value}{" "}
              {(
                order.finalPriceUsd * order.exchangeRates[0].rate
              ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="w-10">
        <Button variant="ghost" size="icon">
          <IconDots className="size-5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface OrdersFilterableListProps {
  orders: Order[];
}

export function OrdersFilterableList({ orders }: OrdersFilterableListProps) {
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sortValue, setSortValue] = useState("order_date_desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  // Build dynamic filter options and hide filters with no options
  const filtersWithDynamicOptions = useMemo(() => {
    const countries = [...new Set(orders.map(getOrderCountry))]
      .filter(Boolean)
      .sort();
    return ORDER_FILTERS.map((f) =>
      f.key === "ship_to" ? { ...f, options: countries } : f,
    ).filter((f) => f.options.length > 0);
  }, [orders]);

  // Apply search (before status filter, so tab counts reflect search)
  const searchFiltered = useMemo(() => {
    if (!searchQuery) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter((order) => {
      if (order.orderNumber.toLowerCase().includes(q)) return true;
      const snapshot = (order.products[0]?.snapshot ?? {}) as Record<
        string,
        unknown
      >;
      const desc = ((snapshot.description as string) ?? "").toLowerCase();
      const title = ((snapshot.title as string) ?? "").toLowerCase();
      return desc.includes(q) || title.includes(q);
    });
  }, [orders, searchQuery]);

  // Apply non-status filters (for tab count computation)
  const nonStatusFiltered = useMemo(() => {
    const nonStatusKeys = Object.keys(filters).filter((k) => k !== "status");
    if (nonStatusKeys.length === 0) return searchFiltered;
    return searchFiltered.filter((order) =>
      nonStatusKeys.every((key) => matchesFilter(order, key, filters[key])),
    );
  }, [searchFiltered, filters]);

  // Compute tab counts from non-status-filtered data
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tab of TABS) {
      if (tab.statusValues.length === 0) {
        counts[tab.key] = nonStatusFiltered.length;
      } else {
        counts[tab.key] = nonStatusFiltered.filter((order) =>
          tab.statusValues.includes(getOrderStatus(order)),
        ).length;
      }
    }
    return counts;
  }, [nonStatusFiltered]);

  // Determine active tab from filters.status
  const activeTab = useMemo(() => {
    const statusFilter = filters.status ?? [];
    if (statusFilter.length === 0) return "all";
    const match = TABS.find(
      (tab) =>
        tab.statusValues.length === statusFilter.length &&
        tab.statusValues.every((v) => statusFilter.includes(v)),
    );
    return match?.key ?? "all";
  }, [filters]);

  // Apply ALL filters (including status)
  const fullyFiltered = useMemo(() => {
    const allKeys = Object.keys(filters);
    if (allKeys.length === 0) return searchFiltered;
    return searchFiltered.filter((order) =>
      allKeys.every((key) => matchesFilter(order, key, filters[key])),
    );
  }, [searchFiltered, filters]);

  // Sort
  const sorted = useMemo(
    () => sortOrders(fullyFiltered, sortValue),
    [fullyFiltered, sortValue],
  );

  // Paginate
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginatedOrders = sorted.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  // Reset page when filters/search/sort change
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

  function handleTabClick(tab: TabDef) {
    if (tab.statusValues.length === 0) {
      // "All" tab — clear status filter
      const next = { ...filters };
      delete next.status;
      setFilters(next);
    } else {
      setFilters({ ...filters, status: tab.statusValues });
    }
    setPage(1);
  }

  return (
    <>
      {/* Grid tabs */}
      <div className="grid grid-cols-5 gap-4">
        {TABS.map((tab) => (
          <GridTab
            key={tab.key}
            tab={tab}
            count={tabCounts[tab.key] ?? 0}
            active={activeTab === tab.key}
            onClick={() => handleTabClick(tab)}
          />
        ))}
      </div>

      {/* Filters + Table */}
      <div className="flex flex-col gap-4">
        {/* Filter bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2">
            <SearchInput onSearch={handleSearch} placeholder="Search..." />
            <FilterBar
              filters={filtersWithDynamicOptions}
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
              <TableHead className="max-w-md">Ordered item</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Order date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Final price</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
            {paginatedOrders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  No orders match your filters.
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
    </>
  );
}
