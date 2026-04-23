"use client";

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: string;
}

export interface SearchResultProduct extends SearchResultItem {
  subcategory: string;
  image: string;
  priceLabel: string;
  formattedPrice: string;
}

export interface SearchResultOrder extends SearchResultItem {
  image: string;
  date: string;
  status: string;
}

export interface SearchResultRequest extends SearchResultItem {
  image: string;
  date: string;
  status: string;
}

export interface SearchResultInvoice extends SearchResultItem {
  date: string;
  amount: string;
  status: string;
}

export interface SearchResults {
  products: SearchResultProduct[];
  orders: SearchResultOrder[];
  invoices: SearchResultInvoice[];
  shortlists: SearchResultItem[];
  requests: SearchResultRequest[];
}

const EMPTY_RESULTS: SearchResults = {
  products: [],
  orders: [],
  invoices: [],
  shortlists: [],
  requests: [],
};

// ---------------------------------------------------------------------------
// Mock data — all scoped here for easy purging when real APIs are wired up
// ---------------------------------------------------------------------------

const MOCK_PRODUCTS: SearchResultProduct[] = [
  {
    id: "d001",
    title: "1.01ct Round D IF Excellent Cut",
    subtitle: "Natural Diamond · $18,750",
    href: "/buyer/browse/natural-diamonds/d001",
    category: "Natural Diamond",
    subcategory: "Natural Diamond",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    priceLabel: "$18,750",
    formattedPrice: "$18,750.00",
  },
  {
    id: "d002",
    title: "0.71ct Round E VVS1 Excellent Cut",
    subtitle: "Natural Diamond · $4,890",
    href: "/buyer/browse/natural-diamonds/d002",
    category: "Natural Diamond",
    subcategory: "Natural Diamond",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    priceLabel: "$4,890",
    formattedPrice: "$4,890.00",
  },
  {
    id: "d003",
    title: "2.03ct Round F VS1 Excellent Cut",
    subtitle: "Natural Diamond · $28,400",
    href: "/buyer/browse/natural-diamonds/d003",
    category: "Natural Diamond",
    subcategory: "Natural Diamond",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    priceLabel: "$28,400",
    formattedPrice: "$28,400.00",
  },
  {
    id: "d004",
    title: "1.50ct Oval G VVS2 Very Good Cut",
    subtitle: "Natural Diamond · $14,200",
    href: "/buyer/browse/natural-diamonds/d004",
    category: "Natural Diamond",
    subcategory: "Natural Diamond",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    priceLabel: "$14,200",
    formattedPrice: "$14,200.00",
  },
  {
    id: "d005",
    title: "0.50ct Princess D VS2 Excellent Cut",
    subtitle: "Natural Diamond · $2,850",
    href: "/buyer/browse/natural-diamonds/d005",
    category: "Natural Diamond",
    subcategory: "Natural Diamond",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    priceLabel: "$2,850",
    formattedPrice: "$2,850.00",
  },
  {
    id: "lg001",
    title: "1.25ct Cushion E VS1 Excellent Cut",
    subtitle: "Lab Grown Diamond · $1,200",
    href: "/buyer/browse/lab-grown-diamonds/lg001",
    category: "Lab Grown Diamond",
    subcategory: "Lab Grown Diamond",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    priceLabel: "$1,200",
    formattedPrice: "$1,200.00",
  },
  {
    id: "lg002",
    title: "2.00ct Emerald F VVS2 Very Good Cut",
    subtitle: "Lab Grown Diamond · $2,400",
    href: "/buyer/browse/lab-grown-diamonds/lg002",
    category: "Lab Grown Diamond",
    subcategory: "Lab Grown Diamond",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    priceLabel: "$2,400",
    formattedPrice: "$2,400.00",
  },
  {
    id: "gs001",
    title: "2.15ct Oval Vivid Red Ruby",
    subtitle: "Gemstone · $68,000",
    href: "/buyer/browse/gemstones/gs001",
    category: "Gemstone",
    subcategory: "Gemstone",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-gemstone.png",
    priceLabel: "$68,000",
    formattedPrice: "$68,000.00",
  },
  {
    id: "gs002",
    title: "3.50ct Oval Blue Sapphire",
    subtitle: "Gemstone · $12,500",
    href: "/buyer/browse/gemstones/gs002",
    category: "Gemstone",
    subcategory: "Gemstone",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-gemstone.png",
    priceLabel: "$12,500",
    formattedPrice: "$12,500.00",
  },
  {
    id: "er001",
    title: "Solitaire Round Diamond Ring",
    subtitle: "Engagement Ring · From $3,200",
    href: "/buyer/browse/jewelry/engagement-rings/er001",
    category: "Engagement Ring",
    subcategory: "Engagement Ring",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-ring.png",
    priceLabel: "From $3,200",
    formattedPrice: "$3,200.00",
  },
];

const MOCK_ORDERS: SearchResultOrder[] = [
  {
    id: "ord-001",
    title: "Order #ORD-001",
    subtitle: "Delivered · 3 items",
    href: "/buyer/orders/ord-001",
    category: "Order",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    date: "Oct 15 2024",
    status: "Delivered",
  },
  {
    id: "ord-002",
    title: "Order #ORD-002",
    subtitle: "In Transit · 1 item",
    href: "/buyer/orders/ord-002",
    category: "Order",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    date: "Nov 02 2024",
    status: "In Transit",
  },
  {
    id: "ord-003",
    title: "Order #ORD-003",
    subtitle: "Processing · 2 items",
    href: "/buyer/orders/ord-003",
    category: "Order",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    date: "Nov 20 2024",
    status: "Processing",
  },
  {
    id: "ord-004",
    title: "Order #ORD-004",
    subtitle: "Pending Payment · 1 item",
    href: "/buyer/orders/ord-004",
    category: "Order",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    date: "Dec 01 2024",
    status: "Pending Payment",
  },
];

const MOCK_INVOICES: SearchResultInvoice[] = [
  {
    id: "inv-001",
    title: "INV-2024-0412",
    subtitle: "$4,200.00 · Paid",
    href: "/buyer/finances",
    category: "Invoice",
    date: "Oct 18 2024",
    amount: "$4,200.00",
    status: "Paid",
  },
  {
    id: "inv-002",
    title: "INV-2024-0389",
    subtitle: "$1,800.00 · Pending",
    href: "/buyer/finances",
    category: "Invoice",
    date: "Nov 05 2024",
    amount: "$1,800.00",
    status: "Pending",
  },
  {
    id: "inv-003",
    title: "INV-2024-0355",
    subtitle: "$7,650.00 · Paid",
    href: "/buyer/finances",
    category: "Invoice",
    date: "Nov 22 2024",
    amount: "$7,650.00",
    status: "Paid",
  },
];

const MOCK_SHORTLISTS: SearchResultItem[] = [
  {
    id: "sl-001",
    title: "Wedding collection",
    subtitle: "12 items",
    href: "/buyer/shortlists",
    category: "Shortlist",
  },
  {
    id: "sl-002",
    title: "Round diamonds shortlist",
    subtitle: "8 items",
    href: "/buyer/shortlists",
    category: "Shortlist",
  },
  {
    id: "sl-003",
    title: "Emerald cuts for client",
    subtitle: "5 items",
    href: "/buyer/shortlists",
    category: "Shortlist",
  },
];

const MOCK_REQUESTS: SearchResultRequest[] = [
  {
    id: "req-001",
    title: "Ring for Mr Appleseed",
    subtitle: "Engagement ring · JR-0024-829374",
    href: "#",
    category: "Request",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-ring.png",
    date: "Nov 11 2024",
    status: "Requested",
  },
  {
    id: "req-002",
    title: "Custom Eternity Band",
    subtitle: "Wedding band · JR-0031-482910",
    href: "#",
    category: "Request",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-ring.png",
    date: "Dec 03 2024",
    status: "Quote available",
  },
  {
    id: "req-003",
    title: "Three-Stone Anniversary Ring",
    subtitle: "Engagement ring · JR-0042-193847",
    href: "#",
    category: "Request",
    image:
      "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-ring.png",
    date: "Jan 15 2025",
    status: "Requested",
  },
];

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

function filterByQuery<T extends SearchResultItem>(items: T[], q: string): T[] {
  const lower = q.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(lower) ||
      item.subtitle.toLowerCase().includes(lower),
  );
}

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  // resolvedQuery tracks which query produced the current results.
  // When it differs from the active query, we know a search is in flight.
  const [resolvedQuery, setResolvedQuery] = useState("");

  const hasEnoughQuery = query.length >= 2;

  useEffect(() => {
    if (!hasEnoughQuery) {
      return;
    }

    // Simulate network latency
    const timer = setTimeout(() => {
      setResults({
        products: filterByQuery(MOCK_PRODUCTS, query),
        orders: filterByQuery(MOCK_ORDERS, query),
        invoices: filterByQuery(MOCK_INVOICES, query),
        shortlists: filterByQuery(MOCK_SHORTLISTS, query),
        requests: filterByQuery(MOCK_REQUESTS, query),
      });
      setResolvedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, hasEnoughQuery]);

  // When query is too short, always show empty results with no loading state
  const activeResults = hasEnoughQuery ? results : EMPTY_RESULTS;
  const isLoading = hasEnoughQuery && resolvedQuery !== query;

  const totalCount =
    activeResults.products.length +
    activeResults.orders.length +
    activeResults.invoices.length +
    activeResults.requests.length;

  return { results: activeResults, isLoading, totalCount };
}
