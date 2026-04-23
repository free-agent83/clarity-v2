export type PlpViewMode = "grid" | "list";

export function parsePlpViewMode(
  view: string | string[] | undefined,
): PlpViewMode {
  return view === "list" ? "list" : "grid";
}
