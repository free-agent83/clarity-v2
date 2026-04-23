# Clarity V2 — Component Library Map

This file is the entry point for agents working with the Clarity V2 component library. It is a thin, high-level index: enough to pick the right component, understand what the theme exposes, and know where to go next. It is not a spec, not a tutorial, and not a replacement for any `COMPONENT.md`.

If you read only one thing before generating UI in this project, read this.

> **Related reading:**
> - [CLAUDE.md](./CLAUDE.md) — session orientation for this package.
> - [CONTRIBUTING.md](./CONTRIBUTING.md) — how to build, test, document, and ship.
> - Each component's own `COMPONENT.md` — props, usage, best practices, deviations.
> - [`src/styles/theme.css`](./src/styles/theme.css) — the authoritative theme.

## 1. Operating principles

A handful of non-negotiable rules shape everything in this package. They are covered in full in [CONTRIBUTING.md](./CONTRIBUTING.md); reproduced here as a fast reminder.

- **The components ARE the design.** Whoever builds UI — engineer, designer, AI agent — should produce design-correct output by using these components unmodified. Extending, restyling, or recreating a component bypasses the guarantee. Reach for the system first; flag gaps rather than route around them.
- **Tokens only, via the theme.** Components never import from `packages/tokens/` and never contain raw literal values (`p-[14px]`, `text-[#222]`). They consume tokens through Tailwind semantic utilities (`bg-primary`, `text-foreground`) or `var(--token)` inside arbitrary syntax. If the token you need doesn't exist, stop and flag it — do not invent one.
- **Top-down token flow.** `packages/tokens/` → `theme.css` (shadcn theme) → components. Each layer reads only from the one above. Component needs never flow back up into the theme.
- **Stories compose from library components.** Storybook stories must never inline a bespoke `<input>`, `<button>`, ad-hoc Tailwind class, or reimplementation of something the library already provides. The story is a small worked example; it is only honest if it uses real components.
- **Agents propose, humans ratify.** New components, new token mappings, changes to the shadcn theme layer, and anything CONTRIBUTING.md doesn't explicitly cover are design-lead decisions. Flag and wait — do not improvise.

## 2. Theme at a glance

The theme is defined in `@theme` inside [`src/styles/theme.css`](./src/styles/theme.css) and exposed to components as Tailwind utility classes. These tables are a *map* of what exists; the CSS file is authoritative for exact values, dark-mode overrides, and recent additions.

Two conventions worth internalising:

- **Every foreground pairs with a surface.** `bg-card` + `text-card-foreground`, `bg-primary` + `text-primary-foreground`, and so on. Pair them; don't mix a surface token with an unrelated foreground.
- **Light and dark are symmetric.** Every token is assigned in both `:root` and `.dark`. Components never branch on mode — Tailwind resolves the active value automatically.

### Colour — semantic roles

| Role | Surface utility | Foreground utility | What it's for |
|------|-----------------|--------------------|---------------|
| Page | `bg-background` | `text-foreground` | The default page canvas and its body text. |
| Card | `bg-card` | `text-card-foreground` | Raised content surfaces: cards, panels, detail blocks. |
| Popover | `bg-popover` | `text-popover-foreground` | Floating surfaces: popovers, dropdown content, tooltips. |
| Primary | `bg-primary` | `text-primary-foreground` | The primary action surface. One per view, sparingly. |
| Secondary | `bg-secondary` | `text-secondary-foreground` | Secondary actions and quieter filled surfaces. |
| Muted | `bg-muted` | `text-muted-foreground` | Low-emphasis surfaces and secondary metadata text. |
| Accent | `bg-accent` | `text-accent-foreground` | Hover / focus tint and small moments of brand emphasis. |
| Express | `bg-express` | `text-express-foreground` | The Nivoda "express" product-tier accent. |
| Destructive | `bg-destructive` | `text-destructive-foreground` | Destructive actions and error surfaces. |
| Success | `bg-success` | `text-success-foreground` | Positive confirmations and success surfaces. |
| Warning | `bg-warning` | `text-warning-foreground` | Cautionary states that aren't errors. |
| Info | `bg-info` | `text-info-foreground` | Informational callouts and neutral notices. |

Hover-state companions (`bg-primary-hover`, `bg-secondary-hover`) exist where an interactive variant needs a dedicated token — prefer these over ad-hoc opacity tweaks.

### Colour — structural

| Utility | Purpose |
|---------|---------|
| `border-border` | The default 1px divider between cards, rows, and sections. |
| `bg-input` / `border-input` | Form control surfaces and their resting borders. |
| `ring-ring` | Focus rings on interactive elements. |
| `bg-sidebar`, `text-sidebar-foreground`, `bg-sidebar-primary`, `bg-sidebar-accent`, `border-sidebar-border`, `ring-sidebar-ring` | Scoped chrome for the `Sidebar` organism — do not use outside its subtree. |
| `text-chart-1` … `text-chart-5` | Categorical series colours for charts. Stable order; do not reassign per chart. |

### Typography

| Token | Utility | Value |
|-------|---------|-------|
| `--font-sans` | `font-sans` | `Inter Variable, sans-serif` |
| `--font-heading` | `font-heading` | Currently aliased to `--font-sans` |

The system ships a single family today. Text hierarchy is expressed through the `Typography` atom's role presets — not through arbitrary size/weight combinations on ad-hoc elements.

### Radius

All radii derive from a single `--radius` base (`0.625rem` / 10px) and scale through semantic utilities.

| Utility | Resolves to |
|---------|-------------|
| `rounded-sm` | `calc(var(--radius) * 0.6)` |
| `rounded-md` | `calc(var(--radius) * 0.8)` |
| `rounded-lg` | `var(--radius)` |
| `rounded-xl` | `calc(var(--radius) * 1.4)` |
| `rounded-2xl` | `calc(var(--radius) * 1.8)` |
| `rounded-3xl` | `calc(var(--radius) * 2.2)` |
| `rounded-4xl` | `calc(var(--radius) * 2.6)` |

`rounded-full` (circles, pills, avatars) is the only non-derived radius in regular use.

### Spacing, sizing, motion

Spacing, sizing, breakpoints, z-index, and animation timing follow Tailwind v4's out-of-the-box scales — the theme does not currently override them. Use the standard Tailwind utilities (`p-4`, `gap-2`, `max-w-3xl`, `transition-colors`, etc.). `tw-animate-css` is imported for keyframe-based animations used by Radix primitives.

## 3. Component index

Components are grouped below by the Storybook sidebar taxonomy — the way you'll browse them when searching by intent. Each entry is tagged with its atomic classification (the folder on disk) and lifecycle status.

**Legend.**
- `atom` / `molecule` / `organism` / `template` — atomic classification (folder on disk).
- `stable` — exported from `src/index.ts` and safe to consume downstream.
- `unstable` — exists in the source tree but not yet barrel-exported. Not for consumer use. [CONTRIBUTING.md](./CONTRIBUTING.md) describes the promotion path.
- `deprecated` — slated for removal; do not introduce new usage.

### Foundations

System-level primitives that shape the rest of the library.

**Brand** · `atom` · `stable` — [COMPONENT.md](./src/components/atoms/brand/COMPONENT.md)
- For: rendering the canonical Nivoda brand mark in any shell or surface.
- Not for: re-coloured or re-drawn brand reproductions outside sanctioned cases.

**Typography** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/typography/COMPONENT.md)
- For: rendering text at one of the system's named role presets.
- Not for: interactive text, custom colour props, or margin-based spacing.

**DirectionProvider** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/direction/COMPONENT.md)
- For: setting LTR/RTL reading direction for descendant Radix primitives.
- Not for: general layout or per-element text alignment.

### Actions

Controls that trigger work.

**Button** · `atom` · `stable` — [COMPONENT.md](./src/components/atoms/button/COMPONENT.md)
- For: triggering a synchronous action on the current page.
- Not for: URL navigation or opening menus — use anchors or `DropdownMenu`.

**ButtonGroup** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/button-group/COMPONENT.md)
- For: visually attaching related buttons as a single contiguous control.
- Not for: unrelated actions or a primary call-to-action cluster.

**DropdownMenu** · `molecule` · `stable` — [COMPONENT.md](./src/components/molecules/dropdown-menu/COMPONENT.md)
- For: offering a list of actions triggered from a button.
- Not for: value selection, form controls, or page navigation.

**Command** · `molecule` · `unstable` — [COMPONENT.md](./src/components/molecules/command/COMPONENT.md)
- For: providing a searchable command-palette list of actions.
- Not for: data entry forms or primary page navigation.

### Forms

Form controls and their supporting scaffolding.

**Input** · `atom` · `stable` — [COMPONENT.md](./src/components/atoms/input/COMPONENT.md)
- For: capturing single-line free-text or numeric form input.
- Not for: multi-line text or fixed option lists.

**Textarea** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/textarea/COMPONENT.md)
- For: capturing free-form, multi-line input that grows with content.
- Not for: single-line or structured formatted input.

**InputGroup** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/input-group/COMPONENT.md)
- For: attaching leading or trailing addons to a single input.
- Not for: grouping multiple standalone inputs into one layout.

**InputOTP** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/input-otp/COMPONENT.md)
- For: capturing a one-time-passcode across discrete digit slots.
- Not for: general numeric input or free-form codes.

**Label** · `atom` · `stable` — [COMPONENT.md](./src/components/atoms/label/COMPONENT.md)
- For: naming a form control accessibly via `htmlFor`.
- Not for: headings, captions, or read-only value text.

**Field** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/field/COMPONENT.md)
- For: wrapping a form control with label, description, and error messaging.
- Not for: non-form layout or unlabelled controls.

**Checkbox** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/checkbox/COMPONENT.md)
- For: selecting zero or more independent options, or a single pre-submit setting.
- Not for: single-pick choices, immediate-effect toggles, or action commands.

**RadioGroup** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/radio-group/COMPONENT.md)
- For: picking exactly one option from a small visible set (2–5).
- Not for: independent toggles, immediate-effect choices, or long option lists.

**Switch** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/switch/COMPONENT.md)
- For: toggling a single setting that takes effect immediately.
- Not for: pre-submit form choices or multi-option selection.

**Toggle** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/toggle/COMPONENT.md)
- For: toggling a single on/off state via a pressed button.
- Not for: standard form submission or navigation triggers.

**ToggleGroup** · `atom` · `stable` — [COMPONENT.md](./src/components/atoms/toggle-group/COMPONENT.md)
- For: picking one or many from a few short, visual options.
- Not for: long lists, verbose labels, or page navigation.

**SegmentedControl** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/segmented-control/COMPONENT.md)
- For: switching between two to four mutually-exclusive UI modes (list/grid view, daily/weekly/monthly).
- Not for: toolbar multi-select (use `ToggleGroup`), panel navigation (use `Tabs`), or long option lists (use `Select` or `RadioGroup`).

**Slider** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/slider/COMPONENT.md)
- For: picking an approximate value or range along a continuous scale.
- Not for: precise numeric entry or small discrete option sets.

**Select** · `molecule` · `stable` — [COMPONENT.md](./src/components/molecules/select/COMPONENT.md)
- For: picking a single value from a moderate option list (~5–50).
- Not for: short lists, typeahead search, multi-select, or navigation.

**Combobox** · `molecule` · `unstable` — [COMPONENT.md](./src/components/molecules/combobox/COMPONENT.md)
- For: picking from a long option list via typeahead filtering.
- Not for: short fixed lists or free-form text entry.

### Filtering

Filtering chrome for listing pages. Composed into the PLP template.

**FilterButton** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/filter-button/COMPONENT.md)
- For: exposing a single applied filter as an editable, dismissable popover chip.
- Not for: non-filter actions, read-only value chips, or multi-step flows.

**RangeFilter** · `molecule` · `unstable` — [COMPONENT.md](./src/components/molecules/range-filter/range-filter.COMPONENT.md)
- For: filtering one or more numeric axes via sliders, inputs, and histograms.
- Not for: categorical filters or precise single-value entry.

**FilterToolbar** · `organism` · `unstable` — [COMPONENT.md](./src/components/organisms/filter-toolbar/COMPONENT.md)
- For: providing complete filter, sort, search, and drawer chrome for listings.
- Not for: pages without filtering or a single ad-hoc filter control.

### Overlays

Floating surfaces that layer above the page.

**Dialog** · `molecule` · `stable` — [COMPONENT.md](./src/components/molecules/dialog/COMPONENT.md)
- For: focusing attention on a short modal task, confirm, or critical alert.
- Not for: passive content, long forms, or background errors.

**AlertDialog** · `molecule` · `unstable` — [COMPONENT.md](./src/components/molecules/alert-dialog/COMPONENT.md)
- For: forcing an explicit confirm/cancel choice on a consequential action.
- Not for: routine tasks, forms, or dismissable informational messages.

**Sheet** · `molecule` · `stable` — [COMPONENT.md](./src/components/molecules/sheet/COMPONENT.md)
- For: opening side-anchored panels for larger tasks, forms, or details.
- Not for: short confirmations or desktop navigation chrome.

**Drawer** · `molecule` · `unstable` — [COMPONENT.md](./src/components/molecules/drawer/COMPONENT.md)
- For: sliding in an edge-anchored panel, typically for mobile surfaces.
- Not for: desktop navigation chrome or persistent sidebars.

**Popover** · `atom` · `stable` — [COMPONENT.md](./src/components/atoms/popover/COMPONENT.md)
- For: showing opt-in secondary content anchored to a trigger, on click.
- Not for: passive hints, modal workflows, or actionable menus.

**HoverCard** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/hover-card/COMPONENT.md)
- For: previewing richer content on hover of a non-essential trigger.
- Not for: essential information (hidden on touch) or required interactions.

**Tooltip** · `atom` · `stable` — [COMPONENT.md](./src/components/atoms/tooltip/COMPONENT.md)
- For: hinting at icon-only or non-obvious controls on hover/focus.
- Not for: essential information, long content, or form validation errors.

### Feedback

Communicating state, progress, and outcomes.

**Alert** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/alert/COMPONENT.md)
- For: persistent, in-context status or validation messages within the page flow.
- Not for: transient toasts, modal interruptions, or form field-level errors.

**InlineBanner** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/inline-banner/COMPONENT.md)
- For: page-level callouts under a page heading — promotional content, feature announcements, advisory notices that apply to the whole view.
- Not for: section-level messages (use `Alert`), app-wide banners above the nav (use `PageBanner`), or transient confirmations (use `Sonner`).

**PageBanner** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/page-banner/COMPONENT.md)
- For: full-bleed, app-level callouts above the navigation — new features, promotions, downtime, holidays. Consumed only by `AppShell` via its `banner` prop.
- Not for: page-level callouts (use `InlineBanner`), section-level messages (use `Alert`), or toasts (use `Sonner`).

**Toaster** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/sonner/COMPONENT.md)
- For: transient, non-blocking notifications and background confirmations.
- Not for: persistent messages, validation errors, or modal interruptions.

**Progress** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/progress/COMPONENT.md)
- For: indicating determinate progress of an ongoing task.
- Not for: indeterminate waits (use `Spinner`) or skeleton placeholders.

**Spinner** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/spinner/COMPONENT.md)
- For: indicating indeterminate loading while an action is in flight.
- Not for: determinate progress or long offscreen background work.

**Skeleton** · `atom` · `stable` — [COMPONENT.md](./src/components/atoms/skeleton/COMPONENT.md)
- For: reserving layout space while content is loading.
- Not for: background work offscreen or sub-second loads.

**Empty** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/empty/COMPONENT.md)
- For: composing empty, no-results, or error states with icon, copy, and CTAs.
- Not for: loading states or inline validation feedback.

### Display

Primitives for arranging and labelling content.

**Card** · `molecule` · `unstable` — [COMPONENT.md](./src/components/molecules/card/COMPONENT.md)
- For: grouping related content into a bordered, elevated surface.
- Not for: primary page chrome or interactive-only triggers.

**Badge** · `atom` · `stable` — [COMPONENT.md](./src/components/atoms/badge/COMPONENT.md)
- For: displaying short status or metadata attached to another element.
- Not for: links, buttons, or any interactive affordance.

**Avatar** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/avatar/COMPONENT.md)
- For: representing a user or entity with an image plus initials fallback.
- Not for: decorative icons or generic imagery unrelated to identity.

**Separator** · `atom` · `stable` — [COMPONENT.md](./src/components/atoms/separator/COMPONENT.md)
- For: visually dividing related groups of content on a surface.
- Not for: a substitute for whitespace or a fake heading.

**AspectRatio** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/aspect-ratio/COMPONENT.md)
- For: constraining a child element to a fixed width-to-height ratio.
- Not for: intrinsic-sized content that shouldn't be forced into a ratio.

**Carousel** · `molecule` · `unstable` — [COMPONENT.md](./src/components/molecules/carousel/COMPONENT.md)
- For: cycling through equal-weight slides via prev/next navigation.
- Not for: critical content that must be simultaneously visible.

**ScrollArea** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/scroll-area/COMPONENT.md)
- For: styled, cross-browser-consistent scrollbars on a bounded region.
- Not for: full-page scroll or unbounded content regions.

**Collapsible** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/collapsible/COMPONENT.md)
- For: showing or hiding a single region of content behind a trigger.
- Not for: multi-section expand/collapse lists — use `Accordion`.

**Item** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/item/COMPONENT.md)
- For: rendering a single row of structured content inside a list or menu.
- Not for: freeform layout blocks outside list/menu contexts.

**Kbd** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/kbd/COMPONENT.md)
- For: rendering a single keyboard key or shortcut inline with text.
- Not for: inline code snippets or arbitrary short text labels.

### Data

Dataset-oriented heavy components.

**Table** · `organism` · `unstable` — [COMPONENT.md](./src/components/organisms/table/COMPONENT.md)
- For: displaying structured tabular data in rows and columns.
- Not for: card grids, key-value layouts, or primary page chrome.

**ChartContainer** · `organism` · `unstable` — [COMPONENT.md](./src/components/organisms/chart/COMPONENT.md)
- For: rendering themed Recharts visualisations with design-system styling.
- Not for: simple progress indicators or static data tables.

### Navigation

Wayfinding and page-level chrome.

**AppShell** · `organism` · `stable` — [COMPONENT.md](./src/components/organisms/app-shell/COMPONENT.md)
- For: the standard Nivoda page chrome, navigation sheet, and search.
- Not for: marketing pages, auth screens, or focused modal flows.

**NavigationMenu** · `organism` · `unstable` — [COMPONENT.md](./src/components/organisms/navigation-menu/COMPONENT.md)
- For: rendering a top-level navigation bar with optional flyout panels.
- Not for: in-page tabbed views or action menus.

**Sidebar** · `organism` · `unstable` — [COMPONENT.md](./src/components/organisms/sidebar/COMPONENT.md)
- For: a persistent, collapsible left-rail navigation structure.
- Not for: overlay navigation sheets or mobile-only chrome.

**Breadcrumb** · `molecule` · `stable` — [COMPONENT.md](./src/components/molecules/breadcrumb/COMPONENT.md)
- For: showing the user's position in a hierarchical app structure.
- Not for: flat navigation or a back button substitute.

**Tabs** · `molecule` · `unstable` — [COMPONENT.md](./src/components/molecules/tabs/COMPONENT.md)
- For: switching between peer views of related content in place.
- Not for: navigating between independent pages or hierarchy levels.

**Accordion** · `molecule` · `unstable` — [COMPONENT.md](./src/components/molecules/accordion/COMPONENT.md)
- For: expanding and collapsing multiple labelled content sections in place.
- Not for: single-region toggles or primary page navigation.

**Pagination** · `molecule` · `unstable` — [COMPONENT.md](./src/components/molecules/pagination/COMPONENT.md)
- For: navigating across pages of a long paged list.
- Not for: infinite-scroll lists or small fully-visible sets.

**Stepper** · `molecule` · `unstable` — [COMPONENT.md](./src/components/molecules/stepper/COMPONENT.md)
- For: displaying progress through an ordered multi-step flow (checkout, returns, onboarding) inside a Dialog or modal surface.
- Not for: general page navigation (use `Tabs` or `Breadcrumb`), single-metric progress (use `Progress`), or non-sequential task lists.

### Templates

Page-level systems that orchestrate organisms, molecules, and atoms into a complete user experience.

**PLP** · `template` · `unstable` — [COMPONENT.md](./src/components/templates/plp/COMPONENT.md)
- For: assembling a product listing page from kit pieces plus the filter subsystem.
- Not for: non-listing pages or a unified wrapped PLP template.

## 4. When in doubt

- **Picking a component.** Scan the index above by intent, open the `COMPONENT.md`, read its Usage Guidelines before writing code.
- **Picking a token.** Use the semantic utility tables in §2. If nothing fits, read [`src/styles/theme.css`](./src/styles/theme.css). If it still doesn't fit, flag it — do not invent.
- **Writing or changing a component.** Read [CONTRIBUTING.md](./CONTRIBUTING.md) first.
- **Anything outside the rules above.** Flag and wait for a ruling from design leadership. Do not improvise.
