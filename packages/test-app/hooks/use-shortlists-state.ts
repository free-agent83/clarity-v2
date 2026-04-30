"use client";

import { useRef, useState } from "react";
import { SHORTLISTS as FIXTURE_SHORTLISTS } from "@/fixtures/shortlists";
import type { Shortlist, ShortlistItem } from "@/fixtures/types/shortlist";

export type { ShortlistItem, Shortlist };

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useShortlistsState() {
  const nextIdRef = useRef(100);
  const [shortlists, setShortlists] = useState<Shortlist[]>(FIXTURE_SHORTLISTS);

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
