const min = Number(process.env.DEMO_LATENCY_MIN_MS) || 80;
const max = Number(process.env.DEMO_LATENCY_MAX_MS) || 320;

export async function simulateLatency(): Promise<void> {
  const delay = min + Math.random() * (max - min);
  await new Promise((r) => setTimeout(r, delay));
}

export function checkSimulateError(
  searchParams: { simulate?: string | string[] } | undefined,
): void {
  const flag = Array.isArray(searchParams?.simulate)
    ? searchParams?.simulate[0]
    : searchParams?.simulate;
  if (flag === "error") throw new Error("Simulated error (?simulate=error)");
}
