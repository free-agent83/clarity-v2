"use client";

import { useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ShortlistItem {
  id: string;
  stockId: string;
  title: string;
  specs: string;
  category: string;
  image: string | null;
  href: string;
  price: number;
  addedAt: string;
}

export interface Shortlist {
  id: string;
  name: string;
  createdAt: string;
  items: ShortlistItem[];
}

// ---------------------------------------------------------------------------
// Mock data — all scoped here for easy purging when real APIs are wired up
// ---------------------------------------------------------------------------

const MOCK_SHORTLISTS: Shortlist[] = [
  {
    id: "sl-001",
    name: "Engagement collection",
    createdAt: "2026-02-14T00:00:00Z",
    items: [
      {
        id: "sli-001",
        stockId: "STK-1001",
        title: "1.01ct Round D IF Excellent Cut",
        specs: "1.01ct · Round · D · IF",
        category: "Natural Diamond",
        image: null,
        href: "/buyer/browse/natural-diamonds/d001",
        price: 18750,
        addedAt: "2026-02-15T10:00:00Z",
      },
      {
        id: "sli-002",
        stockId: "STK-1002",
        title: "0.71ct Round E VVS1 Excellent Cut",
        specs: "0.71ct · Round · E · VVS1",
        category: "Natural Diamond",
        image: null,
        href: "/buyer/browse/natural-diamonds/d002",
        price: 4890,
        addedAt: "2026-02-16T14:30:00Z",
      },
      {
        id: "sli-003",
        stockId: "STK-3001",
        title: "Solitaire Round Diamond Ring",
        specs: "14K White Gold · Round",
        category: "Engagement Ring",
        image: null,
        href: "/buyer/browse/jewelry/engagement-rings/er001",
        price: 3200,
        addedAt: "2026-02-17T09:00:00Z",
      },
      {
        id: "sli-004",
        stockId: "STK-1003",
        title: "2.03ct Round F VS1 Excellent Cut",
        specs: "2.03ct · Round · F · VS1",
        category: "Natural Diamond",
        image: null,
        href: "/buyer/browse/natural-diamonds/d003",
        price: 28400,
        addedAt: "2026-02-18T11:15:00Z",
      },
    ],
  },
  {
    id: "sl-002",
    name: "Client favourites",
    createdAt: "2026-03-01T00:00:00Z",
    items: [
      {
        id: "sli-005",
        stockId: "STK-2001",
        title: "1.25ct Cushion E VS1 Excellent Cut",
        specs: "1.25ct · Cushion · E · VS1",
        category: "Lab Grown Diamond",
        image: null,
        href: "/buyer/browse/lab-grown-diamonds/lg001",
        price: 1200,
        addedAt: "2026-03-02T08:00:00Z",
      },
      {
        id: "sli-006",
        stockId: "STK-4001",
        title: "2.15ct Oval Vivid Red Ruby",
        specs: "2.15ct · Oval · Vivid Red · Minor treatment",
        category: "Gemstone",
        image: null,
        href: "/buyer/browse/gemstones/gs001",
        price: 68000,
        addedAt: "2026-03-03T16:45:00Z",
      },
      {
        id: "sli-007",
        stockId: "STK-4002",
        title: "3.50ct Oval Blue Sapphire",
        specs: "3.50ct · Oval · Blue · No treatment",
        category: "Gemstone",
        image: null,
        href: "/buyer/browse/gemstones/gs002",
        price: 12500,
        addedAt: "2026-03-04T10:00:00Z",
      },
    ],
  },
  {
    id: "sl-003",
    name: "Investment Stones",
    createdAt: "2026-03-15T00:00:00Z",
    items: [
      {
        id: "sli-008",
        stockId: "STK-1004",
        title: "1.50ct Oval G VVS2 Very Good Cut",
        specs: "1.50ct · Oval · G · VVS2",
        category: "Natural Diamond",
        image: null,
        href: "/buyer/browse/natural-diamonds/d004",
        price: 14200,
        addedAt: "2026-03-16T12:00:00Z",
      },
      {
        id: "sli-009",
        stockId: "STK-1005",
        title: "0.50ct Princess D VS2 Excellent Cut",
        specs: "0.50ct · Princess · D · VS2",
        category: "Natural Diamond",
        image: null,
        href: "/buyer/browse/natural-diamonds/d005",
        price: 2850,
        addedAt: "2026-03-17T15:30:00Z",
      },
      {
        id: "sli-010",
        stockId: "STK-2002",
        title: "2.00ct Emerald F VVS2 Very Good Cut",
        specs: "2.00ct · Emerald · F · VVS2",
        category: "Lab Grown Diamond",
        image: null,
        href: "/buyer/browse/lab-grown-diamonds/lg002",
        price: 2400,
        addedAt: "2026-03-18T09:00:00Z",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useShortlistsState() {
  const nextIdRef = useRef(100);
  const [shortlists, setShortlists] = useState<Shortlist[]>(MOCK_SHORTLISTS);

  function getShortlist(id: string) {
    return shortlists.find((sl) => sl.id === id);
  }

  function createShortlist(name: string) {
    const id = `sl-${nextIdRef.current++}`;
    setShortlists((prev) => [
      ...prev,
      { id, name, createdAt: new Date().toISOString(), items: [] },
    ]);
  }

  function renameShortlist(id: string, name: string) {
    setShortlists((prev) =>
      prev.map((sl) => (sl.id === id ? { ...sl, name } : sl)),
    );
  }

  function deleteShortlist(id: string) {
    setShortlists((prev) => prev.filter((sl) => sl.id !== id));
  }

  function removeItem(shortlistId: string, itemId: string) {
    setShortlists((prev) =>
      prev.map((sl) =>
        sl.id === shortlistId
          ? { ...sl, items: sl.items.filter((item) => item.id !== itemId) }
          : sl,
      ),
    );
  }

  return {
    shortlists,
    getShortlist,
    createShortlist,
    renameShortlist,
    deleteShortlist,
    removeItem,
  };
}
