---
title: PLP Template — Architectural Spec
authors:
  - João Gomes
  - Claude Code
date: 2026-04-16
status: Draft
tags:
  - design-system
  - architecture
  - spec
  - plp
  - product-listing-page
  - component-design
  - filtering
  - grid-view
  - list-view
  - accessibility
  - responsive
  - analytics
---

# PLP Template — Architectural Spec

## Purpose

An architectural overview of the Product Listing Page template system for our design system. The goal is a consistent PLP experience across all product categories, with enough flexibility to accommodate category-specific data, variants, and user-context-driven rendering.

This document describes **responsibilities, boundaries, behaviours, and contracts**. How the system is decomposed into specific components is an engineering decision informed by this document.

What's covered:

- The PLP's structural parts and what each is responsible for
- The filtering system and its interaction surfaces
- The grid item model (structure, variant system, user context, composition principles)
- The list view model (column system, actions, behaviours)
- Cross-cutting concerns: accessibility, responsive behaviour, loading/empty/error states, analytics
- Future features and open questions

What's not covered:

- Visual design, spacing, typography, colour
- Per-category implementations (diamonds, emeralds, wedding rings, etc.)
- The filter control primitives themselves

---

## 1. Top-level PLP structure

A PLP is composed of these parts, in this order:

1. **Breadcrumbs** — supports arbitrary nesting for subcategories.
2. **Heading area** — category title, optional supplementary link (e.g., "More info about Sapphire gemstones"), results count.
3. **Toolbar** — search, filters entry points, optional grid/list view toggle, sort.
4. **Active filters strip** — appears below the toolbar when filters are engaged; becomes sticky at the top of the viewport when the toolbar scrolls out of view.
5. **Content area** — grid of products or list view of products, depending on current view mode.
6. **Pagination** — at the bottom of the content area.

The template enforces this order. Consumers supply data, configuration, and callbacks; they do not compose these parts themselves.

### List view availability

Not every category has a list view. Categories opt in. The grid/list view toggle in the toolbar hides itself when list view is not available for the category.

### State and data ownership

The template is **stateless with respect to data fetching, routing, and persistence**. It receives filter state, sort state, view mode, pagination, items, and loading/error status; it emits change events. Fetching, URL sync, and caching are concerns of the consuming page.

---

## 2. Filtering architecture

Filtering has three interaction surfaces that must share a single source of truth:

1. **Quick filters** — a curated subset of filters promoted to the toolbar for one-click access. The curated subset is configured per category.
2. **All Filters drawer** — the complete set of filters for the category, opened from an "All Filters" button. Appears as a left-side sheet. The drawer includes the quick filters redundantly; advanced users expect to find everything there.
3. **Active filters strip** — shows currently applied filters as editable chips below the toolbar.

### 2.1 Single source of truth for filter controls

A hard requirement: **the same filter control is used regardless of entry point.** When a user opens a Color filter from a toolbar quick filter, from inside the All Filters drawer, or from the active filters chip, the rendered control is the same — not a visually similar duplicate. This is a correctness concern (no drift between surfaces) and a maintenance concern (one place to change behaviour).

The system must enforce this architecturally rather than relying on developer discipline.

### 2.2 Quick filter interaction

- Clicking a quick filter opens a popover.
- The popover contains the filter control, an Apply button, and a Clear button.
- A quick filter shows an active visual state when it has a value set, regardless of which surface set the value.

### 2.3 All Filters drawer interaction

- Triggered by the "All Filters" button.
- Left-side sheet containing the full filter list (can be long).
- Apply and Clear all buttons.
- Includes all quick filters redundantly.

### 2.4 Active filters behaviour

When one or more filters are engaged:

1. The All Filters button shows a badge with the **count of distinct filter types** with values — not the count of individual selected values within a multi-select. So Color=Red,Blue + Clarity=VS1 counts as 2, not 3.
2. Engaged quick filters show their active state in the toolbar.
3. An active filters strip appears below the toolbar. Each chip follows the format `Filter name: value` (multi-select values joined with commas). Chips are interactive:
   - Clicking a chip opens the same filter control the drawer and quick filter use, for editing.
   - A dismiss affordance on each chip clears that filter directly.
4. When the toolbar scrolls out of view, the strip becomes **sticky at the top of the viewport** as a horizontally-scrollable bar. Chip behaviour in the sticky bar is identical to the non-sticky strip.

### 2.5 Filter flexibility

Filters vary enormously across categories. The filtering system must support this variety without locking categories into a fixed set of filter UIs. The design rests on three ideas:

#### 2.5.1 A preset library of filter types

The system ships a library of common filter types that covers the large majority of real-world filters. Categories compose filters by referencing presets and supplying the data. The preset library should include, at minimum:

| Preset | Example uses | Input shape | Notes |
|---|---|---|---|
| Boolean chip | "Only Nivoda Curated items", "Returnable items only" | Single on/off chip | When on, the filter is active. |
| Single-select chips | "Delivery time: 1-3 days / 5 days or less / …" | One of N | Mutually exclusive. |
| Multi-select chips | "Clarity", "Color", "Cut", "Country of origin", "Treatment", "Tourmaline type" | Any of N | Each option's visual rendering (bare label, label + colour swatch, label + shape icon, label + flag, etc.) is supplied alongside the option itself. The preset doesn't care — the adornment is an option-level concern, not a filter-type concern. This keeps the preset list small. |
| Range slider | "Price", "Carat" | Numeric min/max | May be paired with a distribution histogram (§2.5.3). Accompanied by numeric min/max inputs for precise entry. |
| Multi-axis range | "Size (mm)": Length × Width × Depth | Multiple numeric min/max pairs within a single filter | Renders as a grouped set of range inputs under one filter label. |
| Single-select dropdown | "Location" | One of N | Used when the option list is too long for chips or when free-text search helps discovery. |
| Async searchable dropdown | "Supplier" | One of N, loaded on demand | For high-cardinality lookups. Needs a debounce contract and a "no results" state. |

New presets can be added as the platform grows. Adding a preset is a design-system-level decision, not a category-level one, because new presets affect every category.

#### 2.5.2 Custom (one-off) filters

Some filters will not fit any preset — they are genuinely unique to a single category or use case. The system must allow a category to supply a **custom filter control** and have it participate in the filter system as a first-class citizen: it appears in the All Filters drawer, it can be promoted to a quick filter, it contributes to the active filters strip, and its value shape is the category's concern.

Rules for custom filters:

- They are the **exception, not the rule**. Anything that looks like a preset should use the preset. Custom filters drift visually over time, and too many undermines the consistency the system is meant to protect.
- A custom filter must still provide the same contract surface as a preset filter: a label, a control, a value, a change handler, and a way to describe the value as a chip string for the active filters strip.
- If a custom filter is proposed that would be useful to a second category, that's a signal to promote it into the preset library.

#### 2.5.3 Auxiliary data for rich filter UIs

Some filter UIs need more than just current value and options — they need context from the current result set:

- **Histograms on range sliders** (as shown for Carat and Price in the wireframe) reflect the distribution of the current result set. The distribution data must come from the consumer, since only the consumer knows the result set.
- **Result-count-aware labels** — e.g., option chips showing how many items match if selected ("Blue (1,234)") — also depend on the current result set.

These are not always needed, but the filter configuration contract must allow auxiliary data to flow to a filter when the category/consumer has it. Presets that support auxiliary data should document what data they accept and how they behave when it's missing (e.g., a range slider with no histogram data simply omits the histogram — it doesn't break).

#### 2.5.4 What the category provides

At a high level, a category provides:

- **A list of filter definitions**, each identifying a preset (or declaring itself custom), with its label, options or range bounds, and any auxiliary data.
- **Which filters are promoted to quick filters.**
- **Current applied values.**
- **A change handler.**
- **Optionally, grouping and ordering metadata** for how filters appear in the drawer (the wireframe shows clear visual groupings — "Shipping and returns", "Media", "Tourmaline type" as separate blocks with headings).

#### 2.5.5 Drawer footer

The drawer's primary action is **result-count-aware** ("Show 10,000+ results") rather than a generic "Apply". The count comes from the consumer and must update live as the user changes filters inside the drawer. The secondary action is "Clear filters". The exact copy for zero/one/many results should be handled at the system level so every category renders the footer identically.

#### 2.5.6 What the template is not responsible for

The template is not responsible for URL state, server-side filtering, or persistence.

---

## 3. Grid item model

The grid item is the heart of the system. It must enforce a consistent structure across all categories while accommodating category-specific content and a matrix of user/server-driven variants.

### 3.1 Structure (fixed, in render order)

1. Thumbnail (1:1, interactive)
2. Name
3. Lead *(optional)* — subcategory, SKU, or similar
4. Badges *(optional)* — certification lab, country of origin, Express delivery, etc.
5. Category slot, top *(optional)* — e.g., diamond dimensions
6. Delivery info
7. Returns info
8. Pricing info
9. Stone shapes / materials slot *(optional)*
10. Primary action (Add to cart) + optional secondary action

Order is enforced by the system. Categories may supply content for the optional slots and may opt out of certain auto-behaviours (§3.3), but they cannot reorder, and they cannot substitute their own rendering for sections driven by user context or server flags.

### 3.2 Composition principles

Categories need two kinds of flexibility:

- **Data-shape variance** — finite enums and booleans known up front per category (which thumbnail actions are allowed, whether a secondary action exists, which auto-behaviours are suppressed). Well-suited to a **configuration object**.
- **Content variance** — open-ended, category-specific content that goes into the optional slots (lead, badges, category slot). Well-suited to **slotted content patterns**.

The architectural principle:

> The template decides **where** things go and **how** shared variants render. The category decides **what** goes in the open slots and **which** opt-in features are enabled.

Structural and ordering integrity must be guaranteed — it cannot be broken by how a category chooses to use the system. As a rough illustration, a category definition might look something like:

```
DiamondGridItem:
  config:
    thumbnailActions: [select, favorite, share, findMatchingPair]
    primaryAction: addToCart
    hasSecondaryAction: true
    suppress: []
  lead content:       -> item SKU
  badges content:     -> CertLab badge, Origin badge
  category slot:      -> DiamondDimensions
  secondary action:   -> RequestHoldButton
```

The structure, variant behaviour, and ordering come from the template; the category fills in the open slots and toggles the configurable bits.

### 3.3 Server- and user-driven variants (inherited for free)

A wide matrix of rendering variants depends on **the user** (pricing model, location, currency, feature flags) and **the item payload** (Express flag, returnable flag, 360 media availability, discount, etc.). When a variant applies to a category, it must render **identically across all categories where it applies** — every category inherits this behaviour automatically, without configuration.

Not every variant is meaningful for every category. Price per carat makes no sense for jewellery; legacy pricing is specific to diamonds; discount treatments may only apply to certain item types. The table below lists variants the base system must handle, with a note on applicability:

| Variant | Driven by | Applicability | Behaviour |
|---|---|---|---|
| Express delivery | Item payload | All categories | Express badge in badge area + Express styling in delivery section |
| Shipping origin | Item payload | All categories | Shown in delivery section |
| Returnable / non-returnable | Item payload | All categories | "Returnable" label with fair-use link, or "Non-returnable" label |
| Multi-currency display | User currency ≠ item base currency | All categories | Secondary line showing base-currency price |
| Tariffs | US user + item includes tariffs | All categories | "Stone price including US tariffs" label |
| 360 media availability | Item payload | All categories (desktop — see §6.3 for mobile) | Thumbnail fades into rotatable 360 on hover |
| Price per carat | Item payload | Categories that sell by weight (loose stones, not jewellery) | Secondary line under main price |
| Legacy pricing | User pricing model | Diamond-specific | Two prices shown: stone price + final delivered price |
| Discount (e.g., RapNet) | Item payload | Categories where a reference-price discount is meaningful (e.g., diamonds) | Discount % + original struck-through price |

How a category signals which variants apply is a matter of system design, but the mechanism should follow two rules:

- **When a variant applies, its rendering is not negotiable.** The category cannot customize how the variant looks. Visual consistency across categories is the whole point.
- **When a variant does not apply to a category, it is effectively absent.** The category doesn't suppress it, doesn't configure it — it simply never appears in that category because it's irrelevant. "Suppress" is reserved for the case where a variant *does* apply to a category but the category has a specific reason to turn it off (e.g., "this category has 360 media in the data but we've decided not to render it inline").

If a category needs a variant to render *differently*, that's a signal the base system should grow the variant — not that one category should fork its look. This is how visual consistency is protected as the catalogue grows.

### 3.4 User context

The system needs access to pricing model, location (for tariffs), currency, and feature flags. Two ways for this information to arrive:

- **Default:** ambient user context installed at the app root and read by the system internally.
- **Override:** explicit props on the consumer surface for testing, Storybook, or edge cases.

Both paths must be supported. Ambient context is the production path; prop overrides are for non-production scenarios.

### 3.5 Thumbnail behaviour

**Hover behaviour on desktop:**

- An actions toolbar fades in across the top of the thumbnail. The available actions are a fixed, system-owned universe (examples: `select`, `favorite`, `share`, `requestHold`, `findMatchingPair`, `viewMedia`). Each category opts into a subset via configuration; new actions are added centrally so all categories benefit from a coherent set.
- If 360 media is available for the item (and the category has not opted out), the static image fades into the 360 video on hover. Horizontal cursor position within the thumbnail scrubs forward/backward through the video, giving a "rotate the product" feel.
- The Add to cart button appears below the card on hover. It is hidden via visibility/opacity rather than being absent from the DOM, so there is no layout shift when it appears.

**Touch behaviour:** see §6.3.

### 3.6 Badges and progressive disclosure

Badges in the badge area progressively disclose additional information via HoverCards. Examples of expected behaviour:

- Country-of-origin badge: flag, country name, short description.
- Certification lab badge: lab name, certificate number, copy-to-clipboard action, download-certificate link.
- Express delivery badge: explanation of Express delivery terms.

The universe of badge types is not fixed — new badge types will be added as the platform grows. The architectural principle is that **all badges in this area are progressive-disclosure surfaces** with HoverCard content that can include contextual actions, and this behaviour is a property of the badge itself. The grid item is responsible only for rendering the badges the category supplies, in the badge area.

---

## 4. List view model

List view is a convenience for advanced users browsing highly-standardised categories (diamonds is the canonical case). It prioritises scan density and parameter-by-parameter comparison over visual richness.

### 4.1 Column model

Columns fall into two groups:

**Fixed core columns**, present for every list-view-enabled category, handled by the system:

| Column | Notes |
|---|---|
| Thumbnail (leftmost) | 1:1 image. Same media source as grid thumbnail, but without the hover actions toolbar and without 360 rotate. Still clickable to open the item. |
| Name + lead | Name on top, optional lead (SKU / subcategory) underneath. |
| Delivery | Inherits all auto-variants (Express, shipping origin). |
| Returns | Inherits all auto-variants. |
| Price | Main price. Inherits legacy, multi-currency, tariff, and discount variants. |
| Price/ct *(conditional)* | Rendered when the item has a price-per-carat value. Separate column rather than stacked under Price, so the list stays scannable. |
| Actions (rightmost) | Add to cart (primary). A More menu exposes the rest of the action universe, filtered by the category's opted-in thumbnail actions — keeping the action set aligned with grid view. |

**Category-configured columns** fill the middle of the table. Each category defines its own. For example, diamonds might define Carat, Cut, Color, Clarity, Shape; emeralds might define Origin, Treatment, Dimensions.

### 4.2 Badges become columns in list view

In grid view, a badge is a compact surface whose detail reveals on hover. In list view, that information should be **fully visible without interaction** — the whole point of list view is density for scanning. So rather than carrying a "badges column" into list view, the information that badges would collapse gets **unpacked into distinct columns**.

Example: an "IGI" certification badge that reveals `IGI 287329347` plus a download action in grid view becomes a **Certificate** column in list view rendering `IGI 287329347` with an inline download action directly in the cell.

Which "unpacked badge" columns appear is a category decision, expressed alongside the category-configured columns.

### 4.3 Row behaviour

- **Row density:** single density (comfortable). No user toggle; no category configuration.
- **Row click:** opens the product detail, same as clicking the thumbnail or name in grid view.
- **Primary action:** Add to cart, always visible in the Actions column — not hover-gated. List view is scan-dense and hover-gating is inappropriate here.
- **More menu:** exposes the same action universe as the grid thumbnail hover toolbar, filtered by the category's configured thumbnail actions. This keeps the action set aligned across views.

### 4.4 Sticky behaviour

Header is sticky to the top of the scroll container. No sticky columns — horizontal overflow scrolls normally. This matches the "advanced users, dense data" intent: users horizontal-scroll deliberately.

### 4.5 Sorting

Column headers are **not** sortable in list view. All sorting is driven by the toolbar's Sort dropdown, same as grid view. This keeps sort behaviour identical across views and avoids divergent mental models.

### 4.6 Presentation-only

The list view is presentation-only: given items, column definitions, and user/item context, it renders rows. It does not own data fetching, selection state beyond what the template tracks, or sorting. It builds on the design system's existing table foundation.

---

## 5. Accessibility

### 5.1 Keyboard navigation

- **Toolbar:** all controls reachable via Tab in visual order. Filter popovers trap focus while open and restore focus to the trigger on close. Escape closes.
- **All Filters drawer:** focus trapped inside while open. Escape closes and restores focus to the "All Filters" button.
- **Grid view:** grid items are in a list semantic structure. Tab moves through items in reading order. Within an item, Tab visits in order: thumbnail link, badge hovercard triggers, primary action, secondary action. Arrow-key navigation across the grid is not required for v1 but the structure should not be hostile to adding it later.
- **Hover-only UI must have keyboard equivalents.** The thumbnail actions toolbar, badge HoverCards, and Add to cart button on hover must all appear on keyboard focus within the card. The 360 rotate is a progressive enhancement and does not need a keyboard equivalent; the static image remains fully accessible.
- **List view:** standard table keyboard semantics. Tab moves across interactive cells (thumbnail link, certificate download, Add to cart, More menu). Non-interactive cells are skipped.
- **Active filter chips:** each chip is a single focus stop. Enter/Space opens the edit popover. Delete/Backspace clears the filter. The dismiss affordance on the chip is a separate focusable button.

### 5.2 ARIA and semantics

- The PLP root is a `main` landmark.
- Breadcrumbs use `nav` with an appropriate `aria-label` and an ordered list.
- The toolbar is a region with an `aria-label` describing its purpose.
- Results count announces via `aria-live="polite"` on change (e.g., after applying a filter).
- Filter popovers use `role="dialog"` with the filter name as the accessible label.
- The All Filters drawer uses `role="dialog"` with `aria-modal="true"`.
- Pagination uses `nav` with an appropriate `aria-label`.
- The dismiss affordance on active filter chips has an accessible label of the form "Remove filter: {name}".
- Badges with HoverCards must be focusable and trigger the HoverCard on focus, not only on hover.

### 5.3 Screen reader

- When filters change, announce the new results count.
- When switching between grid and list view, announce the change.
- Images must have meaningful alt text driven by the item name (e.g., "1ct Emerald Green Radiant").

---

## 6. Responsive behaviour

### 6.1 Breakpoints

| Breakpoint | Grid columns | Toolbar | Filters |
|---|---|---|---|
| Mobile (< 640px) | 2 columns | Condensed: Sort and All Filters as icon buttons; quick filters hidden behind a "Filters" toggle that expands a horizontal scroll row | All Filters drawer covers full screen |
| Tablet (640–1024px) | 3 columns | Full toolbar; quick filters may overflow horizontally | Drawer as specified (left side) |
| Desktop (≥ 1024px) | 4 columns | Full toolbar, all controls visible | Drawer as specified (left side) |

Column counts are defaults. Whether categories can override per breakpoint is an open question (§9).

### 6.2 List view on mobile

List view is disabled below the tablet breakpoint. The view toggle hides itself. If a user somehow lands on list view at mobile width (e.g., via URL state once that's implemented), the template falls back to grid view.

### 6.3 Hover-gated behaviour on touch

- On touch devices, the thumbnail actions toolbar and Add to cart button are permanently visible rather than hover-gated.
- **360 rotate is disabled in grid view on mobile.** The static thumbnail is shown instead. Users who want to rotate a product on mobile can trigger the `viewMedia` action from the thumbnail actions toolbar, which opens a dedicated Lightbox where the 360 interaction lives. This keeps grid thumbnails cheap on mobile and gives the full rotate experience a better surface. The Lightbox itself is spec'd separately.

---

## 7. Loading, empty, and error states

The PLP has its own states tailored to the listing experience.

### 7.1 Grid view

- **Loading:** render a page-sized set of skeleton grid items. Each skeleton mirrors the grid item structure (thumbnail placeholder, name lines, lead line, badge placeholders, price line) with a shimmer/pulse animation.
- **Empty (no items match filters):** friendly copy, a primary "Clear all filters" action, and, when applicable, a secondary suggestion naming which filters to try removing one at a time (e.g., "Try removing: Color, Clarity").
- **Empty (category has no items at all):** different copy, no clear-filters action.
- **Error:** friendly copy, a Retry action wired to the consumer's retry handler, and a support link.

### 7.2 List view

- **Loading:** page-sized set of skeleton rows matching the configured column structure.
- **Empty / Error:** same content and actions as grid view, rendered within the table's content area or replacing the table entirely — a presentation detail.

### 7.3 State input

The consuming page passes a loading/error status and a retry handler to the template. The template does not fetch.

---

## 8. Analytics

> **Status update (ADR-005, April 2026):** The analytics surface described below was deferred indefinitely during Phase 3. The PLP template does not expose analytics callbacks. Consumers wire analytics at the point where they own state changes (their own filter-state setters, sort setters, pagination setters, add-to-cart handlers, and route handlers). See `docs/architecture/architecture.md` § ADR-005 for the full rationale and the criteria for revisiting.
>
> The remaining content of §8 records the original design and is kept for reference.

The template does not send analytics. It exposes hooks so the consumer can wire events to whatever analytics pipeline they use. All hooks are optional.

### 8.1 Event categories

- **Page-level:** filter applied, filter cleared, All Filters opened, All Filters closed (with a flag for whether changes were applied), sort changed, view mode changed, search submitted, pagination changed.
- **Item-level:** item viewed (fires when an item enters the viewport, deduplicated per session), item clicked, item added to cart, thumbnail action triggered, 360 interacted with, badge HoverCard opened.

Each event passes contextual information appropriate to its kind. Item-level events include the item and its position in the list so ranking analysis is possible downstream.

### 8.2 View tracking

"Item viewed" uses intersection observation with sensible default thresholds (around 50% visible for 300ms). These defaults should be tuneable globally. Confirm exact values with the analytics/data team (§9).

### 8.3 Category-level responsibility

Categories don't wire analytics themselves. The template emits events at the right layer and the consuming page supplies handlers. This keeps analytics consistent across categories and prevents drift.

---

## 9. Future features

Features intentionally out of scope for v1 but worth designing around so they can be added without architectural rework.

### 9.1 Bulk selection (grid and list views)

Users will eventually need to select multiple items and act on them in bulk (e.g., add many to cart, shortlist many, compare). Applies to both views.

Expected behaviour sketch:

- **Grid view:** a selection checkbox within the thumbnail actions toolbar. The `select` thumbnail action is already in the action universe — in v1 it may toggle a visual selected state that has no bulk-action consumer attached yet. When bulk selection ships, that state becomes functional.
- **List view:** a fixed leftmost checkbox column, plus a header checkbox for "select all on this page."
- **Bulk action bar:** when any items are selected, a sticky bar appears (likely at the bottom of the viewport) showing the selection count, a "Clear selection" action, and category-configured bulk actions.
- **Selection state** persists across pagination within a session. The selection representation needs to be identity-based (not object-based) so it survives page changes and data refetches.
- **Analytics:** bulk-selection-changed and bulk-action-triggered events will be added.

The architecture should not preclude these additions. In particular: the thumbnail action universe, the category configuration surface, and the analytics event surface all need to be extensible.

### 9.2 URL state and filter persistence

Filters, sort, view mode, pagination, and eventually selection should be reflected in the URL so that:

- Users can share a filtered view via link.
- Browser back/forward navigates through filter states.
- Deep-linking into a filtered category works on first load.

The template itself remains stateless with respect to routing. The expected pattern is an adapter on the consuming page that reads from and writes to the URL, wired to the template's state props and change events. Encoding format (query string vs. hash vs. path), the precise serialisation rules for each filter type, and handling of URL states that no longer make sense (e.g., list view on mobile) will be addressed in a follow-up spec alongside the first category implementation.

### 9.3 Touch-native 360 interaction in grid view

Currently out of scope. 360 rotation on mobile is accessed via the Lightbox rather than inline in grid items. Revisit if user data shows demand for inline mobile rotate.

---

## 10. Open questions

1. **Responsive grid column overrides** — whether categories should be able to override default grid column counts per breakpoint, or whether the grid column counts are strictly system-controlled.
2. **Thumbnail action universe growth** — process for adding a new action to the shared universe (e.g., "Compare"). This should be documented in the design system contribution guide so the set grows coherently.
3. **"Item viewed" thresholds** — confirm the ~50% visible / ~300ms defaults with the analytics/data team.
