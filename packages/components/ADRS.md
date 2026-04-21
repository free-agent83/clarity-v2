# ADRs — @nivoda/components

Package-scoped architectural decisions for `@nivoda/components`. Records significant technical choices made inside this package — component APIs dropped or reshaped, cross-cutting patterns adopted or rejected, conventions that shape how future components are built.

Project-wide decisions (token pipeline, build tooling, documentation stack, etc.) live in the project-level architecture doc at `docs/architecture/architecture.md` § "Architectural Decisions". This file is for decisions that only affect `packages/components/`.

New entries go at the **bottom** of this file in order, so numbers stay stable as the file grows. See `CONTRIBUTING.md` § "Writing an ADR" for when and how to add one.

---

## ADR-001: Analytics hooks on template components deferred (April 2026)

**Context:** The PLP template's architectural spec (`docs/plans/specs/2026-04-16-plp-template-component-spec.md` §8) described an analytics surface: a set of optional event-emission callbacks the template would expose so consumers could wire the events to their analytics pipeline (Mixpanel, Amplitude, Segment, etc.). Planned page-level events included filter applied/cleared, sort changed, view mode changed, search submitted, pagination changed, All Filters drawer opened/closed. Planned item-level events included item viewed (intersection-observed), item clicked, item added to cart, thumbnail action triggered, 360 interacted, badge HoverCard opened.

Phase 3c was scoped to implement this surface in the PLP template.

**Decision:** Defer the analytics surface indefinitely. The PLP template (and other templates) do not expose an event-emission callback. Consumers wire analytics at the point where they own the state change — in their own filter-state setters, sort setters, pagination setters, add-to-cart handlers, and route handlers — not through a template-provided hook.

**Rationale:**

1. **Granularity mismatch.** A template-emitted event like `"filterApplied"` carries exactly what the template knows: the filter id and value. Real-world analytics requires richer context — user segment, current page URL, A/B test variant, prior user behaviour, funnel step, campaign — that lives at the app level, not the template level. Wiring those in the consumer's own state setters is simpler than threading them through a template callback.

2. **Control inversion concern.** Template-emitted events nudge consumers toward a particular event taxonomy (the names and shapes the template chose). Real analytics programmes converge on their own event naming, often shaped by tooling conventions (Mixpanel's `event_name` guidelines, data-team schemas, existing funnels) that predate any given template. A template dictating event names creates friction with those conventions.

3. **Instrumentation density varies per team.** Some teams track heavily (every hover, every view); some track sparingly (just add-to-cart and purchase). A one-size template callback forces a middle ground that's wrong for both extremes. The consumer's own handlers let each team instrument exactly what they need.

4. **Duplication risk.** Consumer handlers already run on every state-changing action (the template calls `onFilterChange`, `onSortChange`, `onAddToCart`, etc.). A parallel analytics callback would either fire alongside or replace those — introducing either double-tracking or a source-of-truth split. The consumer's existing handlers are the natural hook site.

5. **`itemViewed` specifically is a viewport-observation concern.** Intersection observation for "item viewed" analytics is useful, but it's not template-specific — any list, grid, or feed component could need it. Better to provide it as a standalone hook in a future phase (e.g., `useIntersectionOnce`) that consumers compose into their own item wrappers, rather than baking it into the template's callback surface.

6. **Cost of wrong abstraction is high.** Once a template exposes an analytics event shape, changing it is a breaking change for every consumer. Keeping the template free of analytics concerns defers the taxonomy decision to individual consumers, where the cost of iterating is local.

**Trade-offs accepted:**

- Consumers must wire analytics themselves rather than flipping a single prop on the template. For most consumers this is straightforward (they already have wrapping state-setters where the events naturally belong). For consumers that want turnkey analytics, they write the wiring once in an adapter layer.
- The PLP architectural spec's §8 remains aspirational rather than shipped. Future work may revisit, but only with a concrete use case that demonstrates template-level emission is the right layer.

**Reversibility:** High. Adding an optional `onAnalyticsEvent?: (event) => void` callback to the template in a future phase is non-breaking. The decision here is *not to ship it until a concrete need justifies the abstraction* — not a permanent veto.

**When to reconsider:**

- Multiple consuming apps converge on the same event taxonomy independently — signal that a shared surface is worth the cost.
- A data-team mandate requires specific events from every PLP across the company, making consumer-side wiring error-prone.
- A concrete template-internal event arises that consumers can't observe from the outside (e.g., an intersection-observed viewport event that the template computes internally). This would motivate a narrow, single-event hook rather than the full surface.

**Related:**
- Parent architectural spec: `docs/plans/specs/2026-04-16-plp-template-component-spec.md` §8
- Phase 3 split: Phases 3a (advanced filter presets) and 3b (360 media on hover) shipped. Phase 3c (analytics hooks) deferred by this ADR.
