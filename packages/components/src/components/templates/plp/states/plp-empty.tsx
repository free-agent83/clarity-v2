import { Button } from "../../../atoms/button/button";
import { Typography } from "../../../atoms/typography/typography";

/**
 * Empty state for the PLP content area.
 *
 * Two variants:
 * - `"empty-filtered"` — no items match current filters. Shows "Clear all
 *   filters" action and optional "Try removing" hint.
 * - `"empty-no-items"` — category has no items at all. Shows category-specific
 *   message, no clear-filters action.
 */
export function PlpEmpty({
  variant,
  onClearFilters,
  filterSuggestions,
  message,
}: {
  variant: "empty-filtered" | "empty-no-items";
  onClearFilters?: () => void;
  filterSuggestions?: string[];
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" data-slot="plp-empty">
      <Typography as="h3" variant="h5" className="mt-4">
        {variant === "empty-filtered"
          ? "No items match your filters"
          : "No items available"}
      </Typography>
      <Typography variant="body-2" className="mt-1 max-w-sm text-muted-foreground">
        {variant === "empty-filtered"
          ? "Try adjusting your filters to find what you're looking for."
          : message || "There are no items in this category yet."}
      </Typography>

      {variant === "empty-filtered" && filterSuggestions && filterSuggestions.length > 0 && (
        <Typography variant="body-2" className="mt-2 text-muted-foreground">
          Try removing:{" "}
          <Typography as="span" variant="body-2" emphasis className="text-foreground">
            {filterSuggestions.join(", ")}
          </Typography>
        </Typography>
      )}

      {variant === "empty-filtered" && onClearFilters && (
        <Button variant="outline" className="mt-4" onClick={onClearFilters}>
          Clear all filters
        </Button>
      )}
    </div>
  );
}
