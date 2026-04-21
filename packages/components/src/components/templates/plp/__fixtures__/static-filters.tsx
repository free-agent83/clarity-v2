import { FilterButton } from "../../../atoms/filter-button/filter-button";
import { FilterSection } from "../../../organisms/filter-toolbar/filter-toolbar";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../atoms/toggle-group/toggle-group";

export interface StaticChipOption {
  value: string;
  label: string;
}

const noop = () => {};

/**
 * Inline quick-filter for PLP stories. The popover opens and its
 * internal draft reacts to clicks, but `onApply` is a no-op — the
 * toolbar chip never flips to an active state. Illustrative only.
 */
export function StaticChipSelectFilter({
  label,
  options,
}: {
  label: string;
  options: StaticChipOption[];
}) {
  return (
    <FilterButton<string[]>
      label={label}
      isActive={false}
      initialValue={undefined}
      popoverWidth={320}
      onApply={noop}
      onClear={noop}
      onDismiss={noop}
    >
      {(draft, setDraft) => (
        <ToggleGroup
          type="multiple"
          variant="outline"
          spacing={2}
          value={draft ?? []}
          onValueChange={(next: string[]) =>
            setDraft(next.length > 0 ? next : undefined)
          }
        >
          {options.map((o) => (
            <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
              {o.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
    </FilterButton>
  );
}

/**
 * Drawer chip-select section for PLP stories. Uncontrolled — selecting
 * chips updates local visual state but no commit logic is wired up.
 */
export function StaticChipSection({
  label,
  options,
  separator = true,
}: {
  label: string;
  options: StaticChipOption[];
  separator?: boolean;
}) {
  return (
    <FilterSection label={label} separator={separator}>
      <ToggleGroup type="multiple" variant="outline" spacing={2}>
        {options.map((o) => (
          <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
            {o.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </FilterSection>
  );
}
