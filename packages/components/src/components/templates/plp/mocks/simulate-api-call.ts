/**
 * Centralised mock-backend latencies for Storybook. Tune these in one
 * place to make every story's simulated network traffic feel faster or
 * slower — handy for iterating on loading states or smoothing out
 * chatty interactions during demos.
 */
export const MOCK_LATENCY = {
  /** Debounced search / autocomplete (e.g. supplier lookup). */
  search: 300,
  /** Generic fetch (e.g. filter preview count). */
  fetch: 250,
  /** Full filter-commit roundtrip that refreshes the results list. */
  commit: 600,
} as const;

/**
 * Await a simulated backend API call. Prefer `MOCK_LATENCY.*` constants
 * over hard-coded numbers so Storybook-wide timing stays tunable from
 * a single location.
 */
export async function simulateApiCall(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
