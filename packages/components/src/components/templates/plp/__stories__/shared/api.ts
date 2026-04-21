// ── Mock API client ───────────────────────────────────────────────────
//
// A single grouped `mockApi` object exposes every endpoint the PLP
// stories pretend to call. Seed data lives in `./fixtures.ts`.
// `simulateApiCall` is deliberately module-private — all callers must
// go through a named `mockApi.*` method so fake latency never leaks
// into unrelated hooks.

import { MOCK_SUPPLIERS } from "./fixtures";

/**
 * Centralised mock-backend latencies. Tune in one place to make every
 * story's simulated network traffic feel faster or slower — handy for
 * iterating on loading states or smoothing chatty interactions.
 */
export const MOCK_LATENCY = {
  /** Debounced search / autocomplete (e.g. supplier lookup). */
  search: 300,
  /** Generic fetch (e.g. filter preview count). */
  fetch: 250,
  /** Full filter-commit roundtrip that refreshes the results list. */
  commit: 600,
} as const;

async function simulateApiCall(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockApi = {
  /**
   * Typeahead supplier search. Shape matches a real suppliers endpoint
   * that filters by substring match on `label`.
   */
  async searchSuppliers(query: string) {
    await simulateApiCall(MOCK_LATENCY.search);
    const q = query.toLowerCase();
    return MOCK_SUPPLIERS.filter((s) => s.label.toLowerCase().includes(q));
  },

  /**
   * Returns a count derived from the current draft filter state.
   * Shape-agnostic: counts any keys whose value is not `undefined`.
   */
  async fetchPreviewCount(draftState: object): Promise<number> {
    await simulateApiCall(MOCK_LATENCY.fetch);
    const activeCount = Object.values(draftState).filter(
      (v) => v !== undefined
    ).length;
    return Math.max(1, Math.round(1_234_567 / (activeCount * 3 + 1)));
  },
};
