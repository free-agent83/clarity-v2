# Components Pass 3 — Design

**Date:** 2026-04-22
**Scope:** One spec, staged PRs (one component per PR).
**Components:** Progress enhancements, SegmentedControl (new), InlineBanner (new), PageBanner (new), Stepper (new).

## 1. Architecture & placement

Five deliverables, each shipped as its own `COMPONENT.md` + `.tsx` + `.stories.tsx`, staged as separate PRs. All land as `status: unstable` — not barrel-exported from `src/index.ts` — matching the repo's established promotion path.

| Component | Folder | Classification |
|-----------|--------|----------------|
| Progress | `atoms/progress/` *(existing)* | Atom (unchanged). Additive changes only. |
| SegmentedControl | `atoms/segmented-control/` | Atom. Parallel to `toggle-group`. Compound but single-purpose. |
| InlineBanner | `atoms/inline-banner/` | Atom. Parallel to `alert` — flat compound, single purpose. |
| PageBanner | `atoms/page-banner/` | Atom. Same rationale as InlineBanner. |
| Stepper | `molecules/stepper/` | Molecule. Stateful multi-part compound, closer to `tabs`/`accordion`. |

No new external dependencies. All five components build from Radix primitives already in the tree (`Progress`, `ToggleGroup`) or plain `div`-based compounds.

## 2. Progress — additive changes

Current component colours the indicator `bg-primary` against a `bg-muted` track. This pass adds variants and sizes; no behavioural changes.

**Changes:**
- Add CVA `variant` axis — `default` (`bg-primary`), `success` (`bg-success`), `info` (`bg-info`), `warning` (`bg-warning`), `destructive` (`bg-destructive`). Colour applies to the indicator bar only; the track remains `bg-muted` across all variants.
- Add CVA `size` axis — `default` (`h-1.5`, existing) and `lg` (`h-3`).
- Replace the current `[WIP]` `COMPONENT.md` with a real one at version `0.1.0`.

**API:**
```tsx
<Progress value={60} variant="success" size="lg" />
```

**Non-breaking:** existing call sites that omit `variant` and `size` retain today's appearance.

## 3. SegmentedControl (new)

New atom at `atoms/segmented-control/`. Toggle buttons for switching between mutually-exclusive modes or values — not navigation.

**When to reach for it vs neighbours.**
- **SegmentedControl** — mutually-exclusive mode/view switching (list/grid view, daily/weekly/monthly).
- **ToggleGroup** — toolbar-style controls (bold/italic/align, filter chips). Bold visual weight, supports multi-select.
- **Tabs** — navigation between panels of content.
- **RadioGroup / Select** — form input with 4+ options, or when option values are semantic data rather than UI modes.

### Sub-components

- `SegmentedControl` — root. Wraps `Radix ToggleGroup.Root` with `type="single"` hard-coded. Guarantees a non-empty value (falls back to the first item's value if a user attempts to clear the current selection) — that's what makes it a *control* rather than a toggle.
- `SegmentedControlItem` — individual segment. Wraps `Radix ToggleGroup.Item`. Supports text, icon + text, or icon-only.

### Visual spec

- **Track** — `bg-muted`, `rounded-md`, `p-0.5` (2px internal padding on all sides). The padding is what gives the active pill its inset "iOS-like" appearance.
- **Active pill** — `bg-background` + `shadow-xs` + `rounded-[calc(var(--radius)-2px)]` so corners sit concentrically inside the track radius.
- **Heights** — outer track mirrors Button: `sm` = h-8, `default` = h-11, `lg` = h-15. Inner pill is track height minus 4px (accounting for the 2px padding).
- **States per item** — default, hover, selected (pill moves, lifts via shadow), disabled. Focus ring follows the item, not the track.

### API

```tsx
<SegmentedControl value={view} onValueChange={setView} size="default">
  <SegmentedControlItem value="list">List</SegmentedControlItem>
  <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
</SegmentedControl>
```

### Variants

- **Visual variants:** one (the filled-track look is the component's identity).
- **Sizes:** `sm` / `default` / `lg` mirroring Button. No `icon`-only size variants — items can be icon-only via content, but the size axis controls height uniformly.

## 4. InlineBanner (new)

New atom at `atoms/inline-banner/`. Block-level, page-level callout — hierarchically above `Alert`. Used under page headings on PLPs, dashboards, and similar views.

### Visual tier

Three tiers of in-page messaging, from quietest to loudest:
1. **Alert** — subtle tinted background, section-level, small icon.
2. **InlineBanner** — subtle tinted background, page-level, larger icon or illustration, bigger footprint.
3. **PageBanner** — solid fill, app-level, always above the nav.

InlineBanner uses the same subtle tinted backgrounds as Alert (`bg-success/5`, `bg-info/5`, etc.) — hierarchy over Alert comes from size, position, and the vertically-centred large icon, not from tonality.

### Sub-components

- `InlineBanner` — root. CVA on `variant` (`default | success | info | warning | destructive`) and `size` (`default | lg | xl`). Optional `onDismiss` prop → renders X in the top-right; stateless.
- `InlineBannerTitle` — required heading slot.
- `InlineBannerDescription` — optional body slot.
- `InlineBannerActions` — right-aligned actions slot; holds 1–2 `Button`s.
- `InlineBannerMedia` — illustration/image slot, **only valid at `size="xl"`**.

Icon at `default` / `lg` is passed as a direct `<svg>` child of `InlineBanner` (typically from `@tabler/icons-react`), matching the Alert pattern. The component detects it via `has-[>svg]` and lays out a two-column grid.

### Layout behaviour

- Icon left, text centre, actions right — all vertically centred (the "big, vertically-centred icon" requirement).
- At `xl`, `InlineBannerMedia` occupies the left column and replaces the icon, supporting an illustration up to ~160×160px.
- Dismiss X (when `onDismiss` provided) sits top-right, visually independent of the actions slot.

### Sizes

| Size | Height (approx) | Icon size | Content |
|------|-----------------|-----------|---------|
| `default` | ~64px | ~20px | Title + optional one-line description + optional single action. |
| `lg` | ~104px | ~32px | Title + multi-line description + action slot (1–2 buttons). |
| `xl` | ~180px | Media slot replaces icon | Title + multi-line description + actions + optional illustration. |

### API

```tsx
<InlineBanner variant="info" size="lg" onDismiss={handleDismiss}>
  <IconSparkles />
  <InlineBannerTitle>New: AI-assisted search</InlineBannerTitle>
  <InlineBannerDescription>
    Find inventory faster with natural-language queries.
  </InlineBannerDescription>
  <InlineBannerActions>
    <Button variant="default" size="sm">Try it</Button>
  </InlineBannerActions>
</InlineBanner>
```

## 5. PageBanner (new)

New atom at `atoms/page-banner/`. Full-bleed stripe that sits above the app header — consumed by `AppShell`, never placed anywhere else. Used for product-wide callouts: new features, promotions, downtime, holidays.

### Sub-components

- `PageBanner` — root. CVA on `variant` only (`default | success | info | warning | destructive`). No `size` axis — a single fixed height (~40–44px). Optional `onDismiss` prop → renders X on the right edge; stateless.
- `PageBannerTitle` — required short message.
- `PageBannerAction` — optional inline CTA (typically a `Button variant="link"` or small secondary button). Sits after the title on the same line.

Optional inline icon via a direct `<svg>` child (Tabler, ~16px), rendered before the title.

### Visual spec

- **Solid fills across all variants:**
  - `default` → `bg-primary` + `text-primary-foreground` (brand violet).
  - `success` → solid `bg-success` + `text-success-foreground`.
  - `info` → solid `bg-info` + `text-info-foreground`.
  - `warning` → solid `bg-warning` + `text-warning-foreground`.
  - `destructive` → solid `bg-destructive` + `text-destructive-foreground`.
- Centred content, single line, truncates with ellipsis at narrow viewports.

### AppShell integration

`AppShell` gains an optional `banner` prop accepting a `PageBanner` node. The stripe renders outside (above) the header and pushes page content down accordingly. `PageBanner` itself is stateless about its placement — it's just a stripe — but its `COMPONENT.md` documents "only for use inside AppShell".

### API

```tsx
<AppShell banner={
  <PageBanner variant="warning" onDismiss={dismiss}>
    <IconAlertTriangle />
    <PageBannerTitle>Scheduled maintenance this Sunday 02:00–04:00 UTC.</PageBannerTitle>
    <PageBannerAction>
      <Button variant="link" size="sm">Read more</Button>
    </PageBannerAction>
  </PageBanner>
}>
  {/* app content */}
</AppShell>
```

The PageBanner PR ships: the component, the AppShell `banner` prop wiring, and updated AppShell stories showing the shell with and without a banner and across all banner variants.

## 6. Stepper (new)

New molecule at `molecules/stepper/`. Displays progress through a multi-step flow (checkout, returns). Horizontal only in v0.1.

### Sub-components

- `Stepper` — root. Controlled via `activeStep: number` (zero-indexed). Provides context (active step, click handler, error indices). Takes `errorSteps?: number[]` and optional `onStepClick?: (index: number) => void`.
- `StepperItem` — one step. Renders the indicator circle + label + connector line to the next item. Derives its state from its index relative to the root's `activeStep` and `errorSteps`.
- `StepperItemIndicator` — the circle. Renders step number by default; checkmark when `completed`; `IconAlertCircle` when `error`.
- `StepperItemLabel` — the text next to or under the indicator. Always rendered in v0.1 (no compact mode).

### States (derived, not passed)

- **`upcoming`** — `index > activeStep`. Outlined circle, muted text, muted connector going in.
- **`current`** — `index === activeStep`. Filled circle (`bg-primary`), foreground text.
- **`completed`** — `index < activeStep`. Filled circle with checkmark, muted foreground text; outgoing connector is `bg-primary`.
- **`error`** — index is listed in `errorSteps`. Red-filled circle with `IconAlertCircle`, destructive text. Wins over derived state — an errored step at `index === activeStep` renders as error.

### Interactivity

- **Display-only by default.** Steps are inert.
- **Pass `onStepClick`** → `completed` and `error` steps become clickable (cursor-pointer, hover state, keyboard focus, `role="button"`). Current and upcoming steps stay inert regardless.

This matches how checkout flows work: users go back to completed steps to revise input, navigate to errored steps to fix them, but cannot skip forward to steps they haven't reached yet.

### API

```tsx
<Stepper activeStep={1} errorSteps={[]} onStepClick={goToStep}>
  <StepperItem>
    <StepperItemIndicator />
    <StepperItemLabel>Details</StepperItemLabel>
  </StepperItem>
  <StepperItem>
    <StepperItemIndicator />
    <StepperItemLabel>Shipping</StepperItemLabel>
  </StepperItem>
  <StepperItem>
    <StepperItemIndicator />
    <StepperItemLabel>Payment</StepperItemLabel>
  </StepperItem>
  <StepperItem>
    <StepperItemIndicator />
    <StepperItemLabel>Review</StepperItemLabel>
  </StepperItem>
</Stepper>
```

`StepperItem` derives its step number from its index via context — the consumer does not pass an explicit number. The final call-site shape will be refined in the implementation plan.

### Deferred (not in v0.1)

- Vertical orientation.
- Compact (dots-only, no labels) mode.
- Disabled state per step (separate from error).
- Custom per-step icons.

Added when a real use case demands them.

## 7. Cross-cutting — stories, testing, docs

### Storybook stories

Each component ships a `<name>.stories.tsx` covering:
- Default render.
- Every variant × size combination in a visual matrix.
- Interactive states (hover, focus, disabled, selected/current, error where applicable).
- Composed real-world examples: SegmentedControl in a toolbar; InlineBanner under a page heading; PageBanner in AppShell; Stepper inside a Dialog-based checkout flow; Progress with label and description.

All stories compose from library components only — no bespoke `<button>`, inline Tailwind, or ad-hoc reimplementations, per [COMPONENTS.md](../../../packages/components/COMPONENTS.md) §1.

### Testing

Follow existing package conventions: no per-component unit tests are added. `@storybook/addon-a11y` catches axe violations during story authoring. No new test infrastructure.

### Documentation per component

Every folder ships a `COMPONENT.md` with:
- Frontmatter: `name`, `slug`, `version: 0.1.0`, `status: unstable`, `lastUpdated: 2026-04-22`.
- Props tables for every sub-component.
- Usage guidelines (when to use / when not to use, with the correct alternative named).
- Best practices (do / don't).
- Writing guidance where user-facing text is involved (banner titles, stepper labels).
- Quality checklist.

For Progress: replace the current `[WIP]` `COMPONENT.md` with a real one, bumping to `0.1.0`.

### Library-level updates

Every PR also updates:
- [`packages/components/COMPONENTS.md`](../../../packages/components/COMPONENTS.md) — add the new component under the correct taxonomy (SegmentedControl under Actions or Forms, InlineBanner + PageBanner under Feedback, Stepper under Navigation; Progress stays in Feedback) with `for` / `not for` one-liners.
- [`packages/components/CHANGELOG.md`](../../../packages/components/CHANGELOG.md) — one entry per PR following the repo's existing format.
- `src/index.ts` — components remain *not* barrel-exported (status `unstable`). Promotion to `stable` happens in a separate future change.

### PR sequencing

Suggested order (ascending complexity; each PR independently mergeable):

1. Progress (enhancements only).
2. SegmentedControl.
3. InlineBanner.
4. PageBanner (+ AppShell `banner` prop wiring + AppShell story updates).
5. Stepper.

### Out of scope (explicit)

- Figma parity (programme-wide Figma authoring decision pending).
- Dark-mode bespoke tuning beyond what the existing `@theme` block provides.
- Vertical Stepper, Stepper compact mode.
- InlineBanner / PageBanner enter/exit animations.
- SegmentedControl sliding-pill animation (active pill appears instantly on selection change).
- Promotion of any of these components from `unstable` to `stable`.
