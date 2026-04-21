// ── Reference wiring: useFilterController ─────────────────────────────
//
// The canonical pattern for wiring filter state into the PLP assembly.
// Deliberately defined inside the story layer (not exported from the
// library) — the goal is to show consumers how to own filter state
// themselves rather than hide it behind a library hook. Copy, adapt
// to your own state shape, or replace it entirely; the library makes
// no assumptions.

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { MOCK_LATENCY, mockApi } from "./api";
import type { PlpStatus } from "../../plp-types";

export function useFilterController<T extends object>(initial: Partial<T> = {}) {
  const [applied, setApplied] = useState<Partial<T>>(initial);
  const [draft, setDraft] = useState<Partial<T>>(initial);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeIds = (Object.keys(applied) as Array<keyof T>).filter(
    (k) => applied[k] !== undefined
  );

  function openDrawer() {
    setDraft(applied);
    setDrawerOpen(true);
  }

  function applyDraft() {
    setApplied(draft);
    setDrawerOpen(false);
  }

  function setAppliedFor<K extends keyof T>(id: K, v: T[K] | undefined) {
    setApplied((p) => {
      const next = { ...p };
      if (v === undefined) delete next[id];
      else next[id] = v;
      return next;
    });
  }

  function setDraftFor<K extends keyof T>(id: K, v: T[K] | undefined) {
    setDraft((p) => {
      const next = { ...p };
      if (v === undefined) delete next[id];
      else next[id] = v;
      return next;
    });
  }

  const hasActiveDraft = Object.values(draft).some((v) => v !== undefined);

  return {
    applied,
    draft,
    drawerOpen,
    activeIds: activeIds as Array<string>,
    activeCount: activeIds.length,
    hasActiveDraft,
    setDrawerOpen,
    openDrawer,
    applyDraft,
    setAppliedFor,
    setDraftFor,
    clearDraft: () => setDraft({}),
    clearAll: () => setApplied({}),
  };
}

// ── Debounced preview-count fetcher ───────────────────────────────────

export function usePreviewCount(draft: object) {
  const [count, setCount] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const next = await mockApi.fetchPreviewCount(draft);
      setCount(next);
      setLoading(false);
    }, 200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [draft]);

  return { count, loading };
}

// ── Simulated backend-commit latency ──────────────────────────────────
//
// Flips the effective `status` to "loading" for ~commit ms whenever the
// applied state changes so the grid/list briefly shows skeletons.

export function useSimulatedCommitStatus(applied: object, baseline: PlpStatus) {
  const [effective, setEffective] = useState<PlpStatus>(baseline);
  const firstRenderRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    if (baseline !== "success") return;
    setEffective("loading");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setEffective(baseline);
    }, MOCK_LATENCY.commit);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed on `applied` only; baseline changing is a story-setup event, not a commit
  }, [applied]);

  return effective;
}

// ── Toolbar + sticky slot routing ─────────────────────────────────────
//
// Given a buttons-by-id map, a pinned id list, and the currently active
// ids, produce the two slot arrays the FilterToolbar consumes:
// - `toolbarFilters`: pinned ids first (always), then engaged non-pinned
// - `stickyFilters`: only engaged ids (no empty pinned buttons)

export function routeFilterSlots(
  buttons: Record<string, ReactNode>,
  pinnedIds: readonly string[],
  activeIds: string[]
) {
  const pinnedSet = new Set(pinnedIds);
  const engagedNonPinned = activeIds.filter((id) => !pinnedSet.has(id));

  const toolbarFilters = [
    ...pinnedIds.map((id) => buttons[id]),
    ...engagedNonPinned.map((id) => buttons[id]),
  ].filter((n): n is ReactNode => !!n);

  const stickyFilters = activeIds
    .map((id) => buttons[id])
    .filter((n): n is ReactNode => !!n);

  return { toolbarFilters, stickyFilters };
}
