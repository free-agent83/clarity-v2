// ── Jewelry filter UI ─────────────────────────────────────────────────
//
// The toolbar-button factory and drawer body for the Jewelry category.

import { useMemo, type ReactNode } from "react";
import { FilterButton } from "../../../../atoms/filter-button/filter-button";
import { ToggleGroup, ToggleGroupItem } from "../../../../atoms/toggle-group/toggle-group";
import { FilterSection } from "../../../../organisms/filter-toolbar/filter-toolbar";
import { formatMultiSelectChip, labelForValue } from "../shared/formatters";
import type { useFilterController } from "../shared/controller";
import { JEWELRY_FILTER_SCHEMA, type JewelryFilterState } from "./api";

export const JEWELRY_PINNED_IDS = ["stone-shape", "metal"] as const;

export function useJewelryFilterButtons(
  ctrl: ReturnType<typeof useFilterController<JewelryFilterState>>
): Record<string, ReactNode> {
  const { applied, setAppliedFor } = ctrl;
  const { "stone-shape": stoneShape, metal, style } = JEWELRY_FILTER_SCHEMA;

  return useMemo<Record<string, ReactNode>>(
    () => ({
      "stone-shape": (
        <FilterButton<string[]>
          key="stone-shape"
          label="Stone shape"
          chipSummary={formatMultiSelectChip(
            (applied["stone-shape"] ?? []).map((v) =>
              labelForValue(stoneShape, v)
            )
          )}
          isActive={(applied["stone-shape"] ?? []).length > 0}
          initialValue={applied["stone-shape"]}
          onApply={(v) => setAppliedFor("stone-shape", v)}
          onClear={() => setAppliedFor("stone-shape", undefined)}
          onDismiss={() => setAppliedFor("stone-shape", undefined)}
        >
          {(v, set) => (
            <ToggleGroup
              type="multiple"
              variant="outline"
              spacing={2}
              value={v ?? []}
              onValueChange={(next: string[]) =>
                set(next.length > 0 ? next : undefined)
              }
            >
              {stoneShape.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        </FilterButton>
      ),
      metal: (
        <FilterButton<string[]>
          key="metal"
          label="Metal"
          chipSummary={formatMultiSelectChip(
            (applied.metal ?? []).map((v) => labelForValue(metal, v))
          )}
          isActive={(applied.metal ?? []).length > 0}
          initialValue={applied.metal}
          onApply={(v) => setAppliedFor("metal", v)}
          onClear={() => setAppliedFor("metal", undefined)}
          onDismiss={() => setAppliedFor("metal", undefined)}
        >
          {(v, set) => (
            <ToggleGroup
              type="multiple"
              variant="outline"
              spacing={2}
              value={v ?? []}
              onValueChange={(next: string[]) =>
                set(next.length > 0 ? next : undefined)
              }
            >
              {metal.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        </FilterButton>
      ),
      style: (
        <FilterButton<string[]>
          key="style"
          label="Style"
          chipSummary={formatMultiSelectChip(
            (applied.style ?? []).map((v) => labelForValue(style, v))
          )}
          isActive={(applied.style ?? []).length > 0}
          initialValue={applied.style}
          onApply={(v) => setAppliedFor("style", v)}
          onClear={() => setAppliedFor("style", undefined)}
          onDismiss={() => setAppliedFor("style", undefined)}
        >
          {(v, set) => (
            <ToggleGroup
              type="multiple"
              variant="outline"
              spacing={2}
              value={v ?? []}
              onValueChange={(next: string[]) =>
                set(next.length > 0 ? next : undefined)
              }
            >
              {style.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        </FilterButton>
      ),
    }),
    [applied, setAppliedFor, stoneShape, metal, style]
  );
}

export function JewelryDrawerBody({
  ctrl,
}: {
  ctrl: ReturnType<typeof useFilterController<JewelryFilterState>>;
}) {
  const { draft, setDraftFor } = ctrl;
  const { "stone-shape": stoneShape, metal, style } = JEWELRY_FILTER_SCHEMA;
  return (
    <>
      <FilterSection label="Stone shape" separator={false}>
        <ToggleGroup
          type="multiple"
          variant="outline"
          spacing={2}
          value={draft["stone-shape"] ?? []}
          onValueChange={(next: string[]) =>
            setDraftFor("stone-shape", next.length > 0 ? next : undefined)
          }
        >
          {stoneShape.map((o) => (
            <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
              {o.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FilterSection>
      <FilterSection label="Metal">
        <ToggleGroup
          type="multiple"
          variant="outline"
          spacing={2}
          value={draft.metal ?? []}
          onValueChange={(next: string[]) =>
            setDraftFor("metal", next.length > 0 ? next : undefined)
          }
        >
          {metal.map((o) => (
            <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
              {o.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FilterSection>
      <FilterSection label="Style">
        <ToggleGroup
          type="multiple"
          variant="outline"
          spacing={2}
          value={draft.style ?? []}
          onValueChange={(next: string[]) =>
            setDraftFor("style", next.length > 0 ? next : undefined)
          }
        >
          {style.map((o) => (
            <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
              {o.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FilterSection>
    </>
  );
}
