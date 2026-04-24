# Clarity V2 — Engineering Proposal

*From: Chris (design function)*
*Date: 24 April 2026*
*Status: Draft — pending conversation*

---

## TL;DR

Nivoda's design system has been rebuilt from the ground up. It's called Clarity V2. It's designed so that **whatever engineering builds using it ships design-correct on the first pass** — no design QA loop, no drift, no revision cycles. The same library is also agent-consumable, so design and PM can build directly against it as needed. But the primary structural benefit is for engineering: the engineering team stops waiting on design review, and design stops spending hours catching MUI drift.

**No migration commitment is requested at this stage.** Two items are requested:

1. **Approval of the direction.** That Clarity V2 is the right foundation for Nivoda's next-generation design system and component library — worth continuing with the intention of ultimately integrating it with the platform. Not a commitment to any timeline, not a resource ask. If a different direction is preferred, it should be surfaced before further work compounds.
2. **A conversation on migration strategy, at engineering's convenience.** Three options drafted below. This is the substantive discussion — a preferred option is documented below; engineering input is requested before any commitment.

Other work can continue without blocking engineering. A further update will follow when a concrete decision is needed.

---

## Context

The existing platform design system (`libs/shared/components` + `libs/shared/theme` + `libs/shared/style-dictionary`) has accumulated significant legacy:

- **Material UI v7 + emotion runtime** with concrete workaround cost: **81 per-MUI-component override files in `libs/shared/theme/`** doing **89 `styleOverrides` passes** (25 of them for form inputs alone), each deep-selector-targeting MUI's internal class hooks (`alertClasses.icon`, `tabsClasses.indicator`, etc.) to force Nivoda tokens through where MUI's theme API won't reach. On top of that, **723 `sx={}` usages inside `libs/shared/components`** — each one a place where a token can be ignored or overridden inline at the call site. The system is unenforceable by construction, and is the mechanical source of the drift that design QA exists to catch
- **Mobile responsiveness is opt-in at the call site** — applied per-component through `sx` and `useMediaQuery` rather than encoded in component contracts. Breakpoints exist in the theme, but the library doesn't guarantee a mobile-correct output; every feature pays a per-component mobile tax
- **Not agent-consumable** — components lack the clean prop contracts and colocated documentation that AI coding agents need to use them reliably
- **60+ components with 32 component-specific token files** — a governance surface that already needs a dedicated design-system team to keep aligned. That team doesn't exist; the cost is being paid in design QA hours, drift tolerance, and mobile regressions rather than as a visible budget line

The existing system has been audited thoroughly (`docs/research/ds-diagnosis.md`), and Clarity V2 built as a replacement — from first principles for 2026 tooling, agent-consumable by default, and designed to replace platform incrementally.

---

## What Clarity V2 actually is

A standalone design system monorepo (`clarity-v2`) that contains:

### 1. A token pipeline that's already aligned with platform's values

- Nx monorepo, `packages/tokens/`
- W3C DTCG format (the 2025 standard), OKLCH color space
- Bespoke ~200-line build script (not Style Dictionary — Style Dictionary was evaluated and added more complexity than it saved at this scale; ADR-001 has the detail)
- Outputs: web CSS variables, shadcn-flat CSS (light + dark), JS/TS exports, React Native objects, JSON
- **Token values are aligned with platform production values** — a side-by-side audit of every palette was conducted, resulting in 15 explicit decisions. The brand violet, status colors, and neutrals all match what's in production today. See `docs/design/token-decisions.md`.
- This means **migration causes zero visual drift** — the colors in Clarity V2 are already the colors engineering's production apps use.

### 2. A component library foundation

- `packages/components/` — shadcn/ui + Radix UI + Tailwind CSS v4
- React 19, zero-runtime CSS, clean TypeScript contracts
- **~50 components seeded** across atoms, molecules, and organisms — forms (Input, Textarea, Select, Checkbox, Radio, Switch, Slider), display (Badge, Avatar, Alert, Card, Typography, Progress, Separator), overlays (Dialog, Popover, Tooltip, Sheet, Drawer, Hover Card), navigation (Tabs, Breadcrumb, Navigation Menu, Pagination), data (Table, Data Table, Chart), and more
- Each component lands via the shadcn CLI with a default story and a `COMPONENT.md` scaffold. Button is the reference for what a "finished" component looks like (variants, tokens, full accessibility); the rest are at seed quality and being hardened through Phase B

### 3. Documentation and architecture

- Four Architectural Decision Records covering the key technology choices (ADR-001 to ADR-004)
- Full technical architecture document (`docs/architecture/architecture.md`)
- Platform audit and token comparison (`docs/design/token-alignment.md`)
- Testing infrastructure (vitest, 19 tests passing on the token pipeline; the tokens package was refactored on 2026-04-10 to be surface-agnostic, with shadcn theme mapping moved into the components package where it belongs)

### 4. A clear governance model

Clarity V2 is the "law" — components with clear intent and binding precedent. It sits alongside the Experience Framework (the "constitution" — rules for how to build correctly) and Product OS (the "government" — what to build and why). Together these three layers form the system that the rest of the organisation (and its agents) plug into.

---

## Why this matters commercially

### The core outcome: design QA collapses to near zero

Today, Nivoda features ship through a design → engineering → design-QA loop. Design specs the screen, engineering implements it, design reviews the implementation, catches drift, files corrections, engineering revises, design re-reviews. Ship.

That loop exists because the current MUI-based design system doesn't guarantee that "correctly implemented" means "design-correct". Engineers have to interpret mockups. Design has to catch the drift. MUI's `sx` prop makes it easy to deviate from the theme. Component variants are inconsistent across the library. The token system was built before the component library and the two have drifted. This is a decade of accumulated legacy.

The loop is where design and engineering velocity both go. And it's where most of engineering's "waiting on design" time comes from.

**With Clarity V2, the loop collapses.** Engineers import components from `@nivoda/components`. Those components ARE the design — they encode the tokens, spacing, typography, accessibility, and variants that design already approved when the component was built. There is no path by which an engineer can build something "correctly" that is also "design-incorrect". The guard-rails are in the component APIs.

Concretely, this means:

- Engineering ships features without waiting for design review
- Design doesn't need to review implementations because there's nothing to catch
- The design hours freed from QA go into building more components, better documentation, governance — work that makes the system stronger, which compounds
- Engineers stop context-switching between "write code" and "wait for feedback"

This represents a structural change to product delivery, not an incremental one. Self-service for design and PM is a secondary benefit enabled by the same work. The primary commercial lever is what happens when engineering is building with it.

### The secondary benefit: platform modernisation without a rewrite

Because the token values are already aligned with platform production (a full audit was conducted, resulting in 15 explicit alignment decisions — see `docs/design/token-decisions.md`), Clarity V2 components can be introduced into platform gradually:

- New features built on Clarity V2 components instead of MUI
- When an existing MUI component is touched for any reason, it can optionally be replaced with its Clarity V2 equivalent
- Over time, platform becomes Clarity V2-native without a single "big migration sprint"
- Engineering does not have to pause in-flight work to adopt it

The incremental path is explicit. No big bang. No feature freeze. No "migrate Q3 2026 or bust." Legacy MUI stays stable until the code is touched for another reason.

### The tertiary benefit: self-service for design and product

Because the library is built to be consumed by AI coding agents, designers and PMs with tools like Claude Code can also build directly against it. Feature prototypes in hours. Meaningful UI changes without engineering tickets. Small changes, quick experiments, and one-off internal tools can be delivered without engineering capacity — which stays on priority work.

**Validation in progress (Phase B):** The core component set is now seeded, and a validation build is underway — a real Nivoda-style flow (product listing + product detail for diamonds, gemstones, and melee) is being rebuilt against Clarity V2 templates in the test app, with URL-backed filtering wired through to a real database. The objective is to validate that the components hold up under real use, to surface gaps, and to produce a reference artefact of a production-style flow built against Clarity V2.

---

## Migration strategy — three options

### Option A — Strangler fig (incremental replacement across all apps)

Clarity V2 components coexist with MUI. Component-by-component, MUI instances in platform get replaced with Clarity V2 equivalents as features are touched. Both systems run in parallel during migration.

**Pros:**
- No feature freeze, no dedicated migration sprint
- Low risk — each replacement is small and reviewable
- Works across all platform apps at the current pace of development
- Engineering decides per-component when to swap; design provides the replacements and migration notes

**Cons:**
- Long tail — some MUI components might live for years in rarely-touched code paths
- Visual consistency during the transition requires care (token alignment already solves most of this)
- Bundle size bloat during transition as both libraries ship

**Best if:** Engineering wants to spread the work out and avoid disruption. Most similar to how GitHub did it with Primer.

### Option B — Surface-by-surface (take one app to completion first)

Pick one platform app (customer? admin? supplier?) and migrate it entirely to Clarity V2. Then move to the next. MUI stays untouched in the other apps during.

**Pros:**
- One surface becomes a reference implementation — shows what "done" looks like
- Cleaner visual consistency within a surface
- Clearer ownership — "customer app is Clarity V2, admin is MUI" is an easy status to communicate
- Faster end-to-end proof

**Cons:**
- The first surface bears all the cost of learning
- Picking the wrong first surface could drag on
- Not all surfaces are the same complexity

**Best if:** Engineering wants a clear milestone to point at and is willing to commit dedicated time to one surface. Most similar to how some Airbnb teams have done component library migrations.

### Option C — Opportunistic greenfield (new features only)

Don't migrate existing platform code at all. New features are built on Clarity V2. Old MUI code stays where it is and dies gradually as old features are rewritten or removed for other reasons.

**Pros:**
- Lowest engineering overhead — no migration work at all
- Engineering's time stays on product work
- Old code stays stable; new code gets the new foundation
- Fastest to start — no coordination required

**Cons:**
- Platform stays split between two systems forever (or until the old code naturally dies)
- Visual consistency across old and new features might drift
- Requires discipline — engineers have to remember to reach for Clarity V2 when writing new code

**Best if:** Engineering can't commit dedicated migration time but wants to stop the bleeding and have new work land on the new foundation. The pragmatic choice when migration isn't funded.

### Recommendation

**Option C to start, with Option A emerging naturally over time.** Build new features on Clarity V2 from day one. Let old MUI code stay stable until it's touched. When a component is touched, replace it with the Clarity V2 equivalent if the swap is trivial (which, thanks to token alignment, it usually will be).

This gets the work moving without forcing a migration decision, and sets up the natural path to Option A once engineering is comfortable.

---

## Out of scope

- No engineering dev-time commitment in the next 2 weeks
- No pause on feature work
- No migration-strategy decision required today
- No request for engineering review of component-level decisions; design retains those, with engineering input requested when a cross-cutting concern arises
- No deprecation timeline for the existing MUI system
- No modifications proposed to `libs/shared/components`, `libs/shared/theme`, or `libs/shared/style-dictionary`

---

## Work completed to date

- **Phase A complete:** token pipeline (now surface-agnostic), architecture, 15 token alignment decisions, 19-test suite, 4 ADRs, one production-quality component (Button)
- **Phase B well underway:** ~50 components seeded across atoms/molecules/organisms via the shadcn CLI, each with a default story and contribution scaffold; PLP/PDP template primitives in place; a live validation build is running against a real database in the test app
- **Platform audit done:** full inventory of platform's existing design system is in `docs/research/` and informed the token decisions
- **ROADMAP written:** phased plan is in `ROADMAP.md`
- **Governance model documented:** Clarity V2 is the "law" layer of the Experience Framework / Product OS governance model, with binding precedent encoded in component APIs

All of it is in a clean, reviewable Git history in the `clarity-v2` repo, landing through reviewed PRs into `main`.

---

## Open questions

1. **Platform build system compatibility.** Clarity V2 uses Nx + Vite + Tailwind v4 + React 19. Platform is also Nx + React 19. Are there any known integration issues to plan around?
2. **Publishing strategy.** At integration time, what delivery mechanism is preferred? `file:` linking? Private npm registry? Git submodule? Something else?
3. **Versioning.** Semver from day one, or delay until first real consumer?
4. **Storybook hosting.** Platform's Storybook is self-hosted behind VPN (post-Chromatic-incident). Should Clarity V2's Storybook land in the same place? Or a separate subdomain? Or inside Fumadocs?
5. **CI integration.** Does the platform CI need to validate Clarity V2 against platform apps? Or rely on Clarity V2's own tests?
6. **Migration incident recovery.** If Option C (opportunistic) is adopted and a new feature built on Clarity V2 breaks in production, what's the rollback story? This should be agreed before shipping any Clarity V2 code into platform.

---

## Next steps

- Response on directional approval (ask #1)
- Scheduled conversation on migration strategy (ask #2), when convenient
- Integration constraints (build system, publishing, CI) surfaced where relevant
